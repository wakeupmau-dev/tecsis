import { Schema, model } from "mongoose";

export const CHALLENGE_LIFETIME_MS = 5 * 60 * 1000;

const challengeSchema = new Schema(
  {
    challengeId: { type: String, required: true, unique: true },
    challenge: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["registration", "authentication"],
      required: true,
    },
    email: { type: String, trim: true, lowercase: true, default: null },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true, collection: "challenges" },
);

export const Challenge = model("Challenge", challengeSchema);
