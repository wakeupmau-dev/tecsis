import type { NextFunction, Request, Response } from "express";
import { logError } from "../lib/errorLog.js";
import type { Auth } from "../lib/session.js";

export async function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = getClientStatus(error);
  if (status) {
    res.status(status).json({ error: "Bad request" });
    return;
  }

  const auth = res.locals.auth as Auth | undefined;
  await logError(error, { req, userId: auth?.user._id ?? null });
  res.status(500).json({ error: "Something went wrong" });
}

function getClientStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return null;
  const status = (error as { status?: unknown }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return status;
  return null;
}
