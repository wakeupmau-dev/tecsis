import { Schema, model } from "mongoose";

export const SESSION_LIFETIME_MS = 2 * 60 * 60 * 1000;

const sessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    credentialID: { type: String, default: null },
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "sessions" },
);

export const Session = model("Session", sessionSchema);
