import type { Types } from "mongoose";
import { Audit } from "../models/Audit.js";
import { logError } from "./errorLog.js";

type AuditEntry = {
  event: string;
  userId?: Types.ObjectId | null;
  email?: string | null;
  detail?: unknown;
};

export async function recordAudit({
  event,
  userId = null,
  email = null,
  detail = null,
}: AuditEntry) {
  try {
    await Audit.create({ event, userId, email, detail });
  } catch (error) {
    await logError(error, { userId, context: { source: "recordAudit", event } });
  }
}
