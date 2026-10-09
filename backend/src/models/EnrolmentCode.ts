import { Schema, model } from "mongoose";

export const ENROLMENT_CODE_LIFETIME_MS = 10 * 60 * 1000;

const enrolmentCodeSchema = new Schema(
  {
    linkTokenHash: { type: String, required: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    expiresAt: { type: Date, required: true, expires: 0 },
    usedAt: { type: Date, default: null },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "enrolment-codes" },
);

export const EnrolmentCode = model("EnrolmentCode", enrolmentCodeSchema);
