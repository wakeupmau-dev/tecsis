import type { Request, Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import mongoose, { mongo, type Types } from "mongoose";
import { rpID, rpName, rpOrigin } from "../config/webauthn.js";
import { recordAudit } from "../lib/audit.js";
import { logError } from "../lib/errorLog.js";
import { ENROLMENT_REFUSAL, PASSKEY_NOT_SAVED } from "../lib/messages.js";
import { hashToken, mintToken } from "../lib/tokens.js";
import { Challenge, CHALLENGE_LIFETIME_MS } from "../models/Challenge.js";
import { Credential } from "../models/Credential.js";
import { EnrolmentCode } from "../models/EnrolmentCode.js";
import { User } from "../models/User.js";

export const ENROL_CHALLENGE_COOKIE = "enrol_challenge";

export async function registrationOptions(req: Request, res: Response) {
  const token = typeof req.body?.token === "string" ? req.body.token : "";

  const code = token
    ? await EnrolmentCode.findOne({
        linkTokenHash: hashToken(token),
        usedAt: null,
        expiresAt: { $gt: new Date() },
      })
    : null;
  if (!code) {
    await refuse(res, { reason: "no live invitation" });
    return;
  }

  const user = await User.findOne({ email: code.email });
  if (!user || !user.active) {
    await refuse(res, {
      email: code.email,
      reason: user ? "user deactivated" : "no user",
    });
    return;
  }

  if (await Credential.exists({ userId: user._id })) {
    await refuse(res, {
      email: code.email,
      userId: user._id,
      reason: "already enrolled",
    });
    return;
  }

  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpID(),
    userName: user.email,
    userID: isoBase64URL.toBuffer(user.userHandle),
    attestationType: "direct",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
  });

  const challengeId = mintToken();
  const expiresAt = new Date(Date.now() + CHALLENGE_LIFETIME_MS);
  await Challenge.create({
    challengeId,
    challenge: options.challenge,
    purpose: "registration",
    email: user.email,
    expiresAt,
  });

  res.cookie(ENROL_CHALLENGE_COOKIE, challengeId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    expires: expiresAt,
  });
  res.json({ options });
}

export async function registrationVerify(req: Request, res: Response) {
  const challengeId: unknown = req.cookies?.[ENROL_CHALLENGE_COOKIE];
  res.clearCookie(ENROL_CHALLENGE_COOKIE, { path: "/api/auth" });

  if (typeof challengeId !== "string" || !challengeId) {
    await refuse(res, { reason: "no challenge cookie" });
    return;
  }

  const challenge = await Challenge.findOneAndDelete({
    challengeId,
    purpose: "registration",
  });
  if (!challenge || challenge.expiresAt <= new Date() || !challenge.email) {
    await refuse(res, { reason: "no live challenge" });
    return;
  }

  const email = challenge.email;
  const user = await User.findOne({ email });
  if (!user || !user.active) {
    await refuse(res, {
      email,
      reason: user ? "user deactivated" : "no user",
    });
    return;
  }

  if (await Credential.exists({ userId: user._id })) {
    await refuse(res, { email, userId: user._id, reason: "already enrolled" });
    return;
  }

  const code = await EnrolmentCode.findOne({
    email,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!code) {
    await refuse(res, {
      email,
      userId: user._id,
      reason: "invitation no longer live",
    });
    return;
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: req.body as RegistrationResponseJSON,
      expectedChallenge: challenge.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
    });
  } catch (error) {
    await refuse(res, {
      email,
      userId: user._id,
      reason: `verification threw: ${(error as Error).message}`,
    });
    return;
  }

  if (!verification.verified) {
    await refuse(res, { email, userId: user._id, reason: "not verified" });
    return;
  }

  const info = verification.registrationInfo;
  const now = new Date();

  const userId = user._id;
  const codeId = code._id;

  async function saveEnrolment(session: mongoose.ClientSession) {
    await Credential.create(
      [
        {
          userId,
          credentialID: info.credential.id,
          publicKey: isoBase64URL.fromBuffer(info.credential.publicKey),
          counter: info.credential.counter,
          aaguid: info.aaguid,
          backupEligible: info.credentialDeviceType === "multiDevice",
          backupState: info.credentialBackedUp,
          transports: info.credential.transports ?? [],
        },
      ],
      { session },
    );
    await EnrolmentCode.updateOne({ _id: codeId }, { usedAt: now }, { session });
    await User.updateOne({ _id: userId }, { stage: "admitted" }, { session });
  }

  try {
    await mongoose.connection.transaction(saveEnrolment);
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      await refuse(res, {
        email,
        userId: user._id,
        reason: "already enrolled (race)",
      });
      return;
    }
    await logError(error, {
      req,
      userId,
      context: { source: "enrolment.save" },
    });
    await recordAudit({
      event: "code.failed",
      email,
      userId,
      detail: { reason: "save failed", message: (error as Error).message },
    });
    res.status(500).json({ error: PASSKEY_NOT_SAVED });
    return;
  }

  await recordAudit({
    event: "credential.registered",
    email,
    userId: user._id,
    detail: {
      aaguid: info.aaguid,
      fmt: info.fmt,
      deviceType: info.credentialDeviceType,
      backedUp: info.credentialBackedUp,
      userVerified: info.userVerified,
      transports: info.credential.transports ?? [],
    },
  });
  await recordAudit({ event: "code.consumed", email, userId: user._id });
  await recordAudit({ event: "user.admitted", email, userId: user._id });

  res.json({ success: true });
}

async function refuse(
  res: Response,
  {
    email = null,
    userId = null,
    reason,
  }: {
    email?: string | null;
    userId?: Types.ObjectId | null;
    reason: string;
  },
) {
  await recordAudit({ event: "code.failed", email, userId, detail: { reason } });
  res.status(400).json({ error: ENROLMENT_REFUSAL });
}
