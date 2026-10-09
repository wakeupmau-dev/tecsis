import { Schema, model } from "mongoose";

const credentialSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    credentialID: { type: String, required: true, unique: true },
    publicKey: { type: String, required: true },
    counter: { type: Number, required: true, default: 0 },
    aaguid: { type: String, default: null },
    backupEligible: { type: Boolean, required: true },
    backupState: { type: Boolean, required: true },
    transports: { type: [String], default: [] },
    label: { type: String, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "credentials" },
);

export const Credential = model("Credential", credentialSchema);
