import type { NextFunction, Request, Response } from "express";
import { getSession } from "../lib/session.js";

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = await getSession(req);
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.locals.auth = auth;
  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = await getSession(req);
  if (!auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (auth.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.locals.auth = auth;
  next();
}
