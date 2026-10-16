import type { Request, Response } from "express";
import { mongo } from "mongoose";
import { logError } from "../lib/errorLog.js";
import { sendProductsEmail, type Locale } from "../lib/mail.js";
import { CONTACT_FIELD_MAX, EMAIL_REGEX, Lead } from "../models/Lead.js";

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

// The /products contact form. Same collection as the landing form: an email
// we already have gets its contact details updated, a new one becomes a lead.
// No email is sent from here.
export async function saveContact(req: Request, res: Response) {
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

  const name = contactField(req.body?.name);
  const company = contactField(req.body?.company);
  const role = contactField(req.body?.role);
  if (name === undefined || company === undefined || role === undefined) {
    res.status(400).json({ error: "Invalid contact details" });
    return;
  }

  const created = await upsertContact(email, locale, { name, company, role });
  res.status(created ? 201 : 200).json({ saved: true });
}

type ContactDetails = {
  name: string | null;
  company: string | null;
  role: string | null;
};

// Returns true when a new lead was created.
async function upsertContact(
  email: string,
  locale: Locale,
  details: ContactDetails,
) {
  try {
    return await runUpsert(email, locale, details);
  } catch (error) {
    // Two requests for the same new email raced; the other one created it,
    // so this one is now an update.
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      return await runUpsert(email, locale, details);
    }
    throw error;
  }
}

async function runUpsert(
  email: string,
  locale: Locale,
  details: ContactDetails,
) {
  const result = await Lead.findOneAndUpdate(
    { email },
    { $set: filledIn(details), $setOnInsert: { email, locale } },
    { upsert: true, runValidators: true, includeResultMetadata: true },
  );
  return !result.lastErrorObject?.updatedExisting;
}

// Only the fields the visitor filled in, so a blank field on a later
// submission doesn't erase what we already have.
function filledIn(details: ContactDetails) {
  const set: Partial<Record<keyof ContactDetails, string>> = {};
  if (details.name) set.name = details.name;
  if (details.company) set.company = details.company;
  if (details.role) set.role = details.role;
  return set;
}

// Empty or missing → null. Not a string, or too long → undefined (invalid).
function contactField(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length > CONTACT_FIELD_MAX) return undefined;
  return trimmed || null;
}

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

export async function getLeads(_req: Request, res: Response) {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
}
