import type { Request, Response } from "express";
import { mongo } from "mongoose";
import { logError } from "../lib/errorLog.js";
import { sendProductsEmail, type Locale } from "../lib/mail.js";
import { EMAIL_REGEX, Lead } from "../models/Lead.js";

export async function createLead(req: Request, res: Response) {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const locale: unknown = req.body?.locale ?? "en";
  if (!isLocale(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  try {
    const lead = await Lead.create({ email, locale });

    const sent = await sendProductsEmail(lead.email, locale);
    if ("id" in sent) {
      await Lead.updateOne({ _id: lead._id }, { emailSentAt: new Date() });
    } else {
      await Lead.updateOne({ _id: lead._id }, { emailError: sent.error });
      await logError(new Error(sent.error), {
        req,
        context: { source: "lead.email", leadId: lead._id },
      });
    }

    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      res.status(409).json({ error: "Email already registered" });
      return;
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
