import { Schema, model } from "mongoose";

const ERROR_LOG_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const errorLogSchema = new Schema(
  {
    name: { type: String, default: null },
    message: { type: String, required: true },
    stack: { type: String, default: null },
    method: { type: String, default: null },
    path: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    context: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "error-logs",
  },
);

errorLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ERROR_LOG_RETENTION_SECONDS },
);

export const ErrorLog = model("ErrorLog", errorLogSchema);
