import { Schema, model } from "mongoose";

const auditSchema = new Schema(
  {
    event: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, trim: true, lowercase: true, default: null },
    detail: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "audits" },
);

auditSchema.index({ event: 1, createdAt: -1 });

export const Audit = model("Audit", auditSchema);
