import type { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import { recordAudit } from "../lib/audit.js";
import { EMAIL_REGEX } from "../models/Lead.js";
import type { Auth } from "../lib/session.js";
import { createInvitation } from "../lib/invitations.js";
import { Credential } from "../models/Credential.js";
import { ErrorLog } from "../models/ErrorLog.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";

type Role = "admin" | "collaborator";

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "collaborator";
}

export async function createUser(req: Request, res: Response) {
  const { user: admin } = res.locals.auth as Auth;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const role: unknown = req.body?.role ?? "collaborator";

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: "That is not a valid email." });
    return;
  }
  if (!isRole(role)) {
    res.status(400).json({ error: "Role must be admin or collaborator." });
    return;
  }

  try {
    const user = await User.create({ email, role, addedBy: admin._id });
    await recordAudit({
      event: "user.trusted",
      userId: user._id,
      email,
      detail: { role, addedBy: admin._id },
    });
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, stage: user.stage },
    });
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      res.status(409).json({ error: "That person already exists." });
      return;
    }
    throw error;
  }
}

export async function issueInvitation(req: Request, res: Response) {
  const { user: admin } = res.locals.auth as Auth;
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const user = email ? await User.findOne({ email }) : null;
  if (!user) {
    await refuseIssue(res, email, "No such person.");
    return;
  }
  if (!user.active) {
    await refuseIssue(res, email, "That person is deactivated.");
    return;
  }
  if (await Credential.exists({ userId: user._id })) {
    await refuseIssue(res, email, "That person already has a passkey.");
    return;
  }

  const { token, expiresAt } = await createInvitation(email, admin._id);

  await recordAudit({
    event: "code.issued",
    userId: user._id,
    email,
    detail: { issuedBy: admin._id, expiresAt },
  });
  res.status(201).json({ token, expiresAt: expiresAt.getTime() });
}

async function refuseIssue(res: Response, email: string, message: string) {
  await recordAudit({
    event: "code.issue_failed",
    email: email || null,
    detail: { reason: message },
  });
  res.status(400).json({ error: message });
}

export async function revokeCredential(req: Request, res: Response) {
  const { user: admin } = res.locals.auth as Auth;
  const id = req.params.id;

  const user = mongoose.isValidObjectId(id) ? await User.findById(id) : null;
  if (!user) {
    res.status(404).json({ error: "No such person." });
    return;
  }

  const credential = await Credential.findOne({ userId: user._id });
  if (!credential) {
    res.status(404).json({ error: "That person has no passkey." });
    return;
  }

  const userId = user._id;
  const now = new Date();

  async function revoke(session: mongoose.ClientSession) {
    await Credential.deleteOne({ userId }, { session });
    await Session.updateMany(
      { userId, revokedAt: null },
      { revokedAt: now },
      { session },
    );
    await User.updateOne({ _id: userId }, { stage: "trusted" }, { session });
  }

  await mongoose.connection.transaction(revoke);

  await recordAudit({
    event: "credential.revoked",
    userId,
    email: user.email,
    detail: {
      revokedBy: admin._id,
      credentialID: credential.credentialID,
      aaguid: credential.aaguid,
    },
  });
  res.json({ success: true });
}

const ERRORS_PAGE_DEFAULT = 50;
const ERRORS_PAGE_MAX = 200;

export async function listErrors(req: Request, res: Response) {
  const requested = Number(req.query.limit ?? ERRORS_PAGE_DEFAULT);
  const limit = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), ERRORS_PAGE_MAX)
    : ERRORS_PAGE_DEFAULT;

  const before = req.query.before;
  if (before !== undefined && !mongoose.isValidObjectId(before)) {
    res.status(400).json({ error: "Invalid cursor." });
    return;
  }

  const filter = before ? { _id: { $lt: before } } : {};
  const rows = await ErrorLog.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = rows.length > limit;
  const errors = hasMore ? rows.slice(0, limit) : rows;
  const next = hasMore ? String(errors[errors.length - 1]._id) : null;

  res.json({ errors, next });
}
