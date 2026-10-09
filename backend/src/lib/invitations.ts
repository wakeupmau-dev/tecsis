import mongoose, { type Types } from "mongoose";
import {
  EnrolmentCode,
  ENROLMENT_CODE_LIFETIME_MS,
} from "../models/EnrolmentCode.js";
import { hashToken, mintToken } from "./tokens.js";

export async function createInvitation(email: string, issuedBy: Types.ObjectId) {
  const token = mintToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ENROLMENT_CODE_LIFETIME_MS);

  async function mintInvitation(session: mongoose.ClientSession) {
    await EnrolmentCode.updateMany(
      { email, usedAt: null, expiresAt: { $gt: now } },
      { expiresAt: now },
      { session },
    );
    await EnrolmentCode.create(
      [{ linkTokenHash: hashToken(token), email, expiresAt, issuedBy }],
      { session },
    );
  }

  await mongoose.connection.transaction(mintInvitation);
  return { token, expiresAt };
}
