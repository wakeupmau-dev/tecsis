import { Schema, model, type InferSchemaType } from "mongoose";
import { mintToken } from "../lib/tokens.js";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    userHandle: {
      type: String,
      required: true,
      unique: true,
      default: mintToken,
    },
    role: {
      type: String,
      enum: ["admin", "collaborator"],
      required: true,
      default: "collaborator",
    },
    stage: {
      type: String,
      enum: ["trusted", "admitted"],
      required: true,
      default: "trusted",
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: "users" },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User = model("User", userSchema);
