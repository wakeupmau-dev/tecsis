import type { Request, Response } from "express";
import { mongo } from "mongoose";
import { logError } from "../lib/errorLog.js";
import { sendProductsEmail, type Locale } from "../lib/mail.js";
import { EMAIL_REGEX, Lead } from "../models/Lead.js";

export async function createLead(req: Request, res: Response) {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const locale: unknown = req.body?.locale ?? "en";
  if (!isLocale(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  const existing = await Lead.findOne({ email });
  if (existing?.emailSentAt) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const lead = existing ?? (await saveLead(email, locale));
  if (!lead) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const sent = await sendProductsEmail(lead.email, locale);
  if ("id" in sent) {
    await Lead.updateOne(
      { _id: lead._id },
      { locale, emailSentAt: new Date(), emailError: null },
    );
  } else {
    await Lead.updateOne(
      { _id: lead._id },
      { locale, emailError: sent.error },
    );
    await logError(new Error(sent.error), {
      req,
      context: { source: "lead.email", leadId: lead._id },
    });
  }

  res.status(existing ? 200 : 201).json({ emailSent: "id" in sent });
}

async function saveLead(email: string, locale: Locale) {
  try {
    return await Lead.create({ email, locale });
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      return null;
    }
    throw error;
  }
}

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

export async function getLeads(_req: Request, res: Response) {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
}
