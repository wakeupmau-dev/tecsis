import { Schema, model } from "mongoose";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    emailSentAt: { type: Date, default: null },
    emailError: { type: String, default: null },
  },
  { timestamps: true, collection: "leads" },
);

export const Lead = model("Lead", leadSchema);
