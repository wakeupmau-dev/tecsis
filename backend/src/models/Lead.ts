import { Schema, model } from "mongoose";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_FIELD_MAX = 200;

const leadSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: EMAIL_REGEX,
    },
    locale: {
      type: String,
      enum: ["en", "es"],
      required: true,
      default: "en",
    },
    // From the /products contact form; null for leads that only came from
    // the landing form.
    name: {
      type: String,
      trim: true,
      maxlength: CONTACT_FIELD_MAX,
      default: null,
    },
    company: {
      type: String,
      trim: true,
      maxlength: CONTACT_FIELD_MAX,
      default: null,
    },
    role: {
      type: String,
      trim: true,
      maxlength: CONTACT_FIELD_MAX,
      default: null,
    },
    emailSentAt: { type: Date, default: null },
    emailError: { type: String, default: null },
  },
  { timestamps: true, collection: "leads" },
);

export const Lead = model("Lead", leadSchema);
