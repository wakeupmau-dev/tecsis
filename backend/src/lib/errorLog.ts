import type { Request } from "express";
import type { Types } from "mongoose";
import { ErrorLog } from "../models/ErrorLog.js";

type ErrorContext = {
  req?: Request;
  userId?: Types.ObjectId | null;
  context?: Record<string, unknown>;
};

export async function logError(
  error: unknown,
  { req, userId = null, context }: ErrorContext = {},
) {
  const { name, message, stack } = describe(error);

  try {
    await ErrorLog.create({
      name,
      message,
      stack,
      method: req?.method ?? null,
      path: req?.path ?? null,
      userId,
      context: context ?? null,
    });
  } catch (writeError) {
    console.error("logError failed", writeError);
    console.error(error);
  }
}

function describe(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }
  return { name: null, message: String(error), stack: null };
}
