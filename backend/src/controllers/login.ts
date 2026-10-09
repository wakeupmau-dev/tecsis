import type { Request, Response } from "express";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { Types } from "mongoose";
import { rpID, rpOrigin } from "../config/webauthn.js";
import { recordAudit } from "../lib/audit.js";
import { LOGIN_REFUSAL } from "../lib/messages.js";
import { createSession, endSession } from "../lib/session.js";
import { mintToken } from "../lib/tokens.js";
import { Challenge, CHALLENGE_LIFETIME_MS } from "../models/Challenge.js";
import { Credential } from "../models/Credential.js";
import { User } from "../models/User.js";

export const LOGIN_CHALLENGE_COOKIE = "login_challenge";

export async function loginOptions(_req: Request, res: Response) {
  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "required",
  });

  const challengeId = mintToken();
  const expiresAt = new Date(Date.now() + CHALLENGE_LIFETIME_MS);
  await Challenge.create({
    challengeId,
    challenge: options.challenge,
    purpose: "authentication",
    expiresAt,
  });

  res.cookie(LOGIN_CHALLENGE_COOKIE, challengeId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    expires: expiresAt,
  });
  res.json({ options });
}

export async function loginVerify(req: Request, res: Response) {
  const challengeId: unknown = req.cookies?.[LOGIN_CHALLENGE_COOKIE];
  res.clearCookie(LOGIN_CHALLENGE_COOKIE, { path: "/api/auth" });

  if (typeof challengeId !== "string" || !challengeId) {
    await refuse(res, { reason: "no challenge cookie" });
    return;
  }

  const challenge = await Challenge.findOneAndDelete({
    challengeId,
    purpose: "authentication",
  });
  if (!challenge || challenge.expiresAt <= new Date()) {
    await refuse(res, { reason: "no live challenge" });
    return;
  }

  const response = req.body as AuthenticationResponseJSON;
  const credential =
    typeof response?.id === "string"
      ? await Credential.findOne({ credentialID: response.id })
      : null;
  if (!credential) {
    await refuse(res, { reason: "unknown credential" });
    return;
  }

  const user = await User.findById(credential.userId);
  if (!user || !user.active) {
    await refuse(res, {
      userId: credential.userId,
      reason: user ? "user deactivated" : "no user",
    });
    return;
  }

  const returnedHandle = response.response?.userHandle;
  if (returnedHandle && returnedHandle !== user.userHandle) {
    await refuse(res, { userId: user._id, reason: "user handle mismatch" });
    return;
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
      credential: {
        id: credential.credentialID,
        publicKey: isoBase64URL.toBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports,
      },
    });
  } catch (error) {
    await refuse(res, {
      userId: user._id,
      reason: `verification threw: ${(error as Error).message}`,
    });
    return;
  }

  if (!verification.verified) {
    await refuse(res, { userId: user._id, reason: "not verified" });
    return;
  }

  const info = verification.authenticationInfo;
  const backupEligible = info.credentialDeviceType === "multiDevice";
  if (
    backupEligible !== credential.backupEligible ||
    info.credentialBackedUp !== credential.backupState
  ) {
    await recordAudit({
      event: "credential.backup_drift",
      userId: user._id,
      email: user.email,
      detail: {
        from: {
          backupEligible: credential.backupEligible,
          backupState: credential.backupState,
        },
        to: { backupEligible, backupState: info.credentialBackedUp },
      },
    });
  }

  await Credential.updateOne(
    { _id: credential._id },
    {
      counter: info.newCounter,
      backupEligible,
      backupState: info.credentialBackedUp,
      lastUsedAt: new Date(),
    },
  );

  await createSession(res, user._id, credential.credentialID);

  await recordAudit({
    event: "login.succeeded",
    userId: user._id,
    email: user.email,
  });
  res.json({ success: true });
}

export async function logout(req: Request, res: Response) {
  const session = await endSession(req, res);
  if (session) {
    await recordAudit({ event: "session.ended", userId: session.userId });
  }
  res.json({ success: true });
}

async function refuse(
  res: Response,
  { userId = null, reason }: { userId?: Types.ObjectId | null; reason: string },
) {
  await recordAudit({ event: "login.failed", userId, detail: { reason } });
  res.status(400).json({ error: LOGIN_REFUSAL });
}
