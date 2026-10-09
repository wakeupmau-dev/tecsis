import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { Session, SESSION_LIFETIME_MS } from "../models/Session.js";
import { User } from "../models/User.js";
import { hashToken, mintToken } from "./tokens.js";

export const SESSION_COOKIE = "session";

export async function createSession(
  res: Response,
  userId: Types.ObjectId,
  credentialID: string | null,
) {
  const token = mintToken();
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

  await Session.create({
    tokenHash: hashToken(token),
    userId,
    credentialID,
    expiresAt,
  });

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(req: Request) {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || !token) return null;

  const now = new Date();
  const session = await Session.findOne({ tokenHash: hashToken(token) });
  if (!session || session.revokedAt || session.expiresAt <= now) return null;

  const user = await User.findById(session.userId);
  if (!user || !user.active) return null;

  await Session.updateOne({ _id: session._id }, { lastUsedAt: now });
  return { session, user };
}

export async function endSession(req: Request, res: Response) {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  let session = null;

  if (typeof token === "string" && token) {
    session = await Session.findOneAndUpdate(
      { tokenHash: hashToken(token), revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return session;
}

export type Auth = NonNullable<Awaited<ReturnType<typeof getSession>>>;
