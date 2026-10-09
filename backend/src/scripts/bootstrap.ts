import mongoose from "mongoose";
import { recordAudit } from "../lib/audit.js";
import { createInvitation } from "../lib/invitations.js";
import { Credential } from "../models/Credential.js";
import { EMAIL_REGEX } from "../models/Lead.js";
import { User } from "../models/User.js";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) throw new Error("MONGO_URL is not set");

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!EMAIL_REGEX.test(email)) {
  console.error("Usage: npm run bootstrap -- <email>");
  process.exit(1);
}

await mongoose.connect(MONGO_URL);

try {
  const adminIds = (await User.distinct("_id", {
    role: "admin",
  })) as mongoose.Types.ObjectId[];
  const enrolledAdmin = await Credential.exists({ userId: { $in: adminIds } });
  if (enrolledAdmin) {
    console.error(
      "An admin is already enrolled. Invite new people from the admin UI.",
    );
    process.exitCode = 1;
  } else {
    await bootstrap();
  }
} finally {
  await mongoose.disconnect();
}

async function bootstrap() {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, role: "admin" });
    await recordAudit({
      event: "user.trusted",
      userId: user._id,
      email,
      detail: { role: "admin", addedBy: "bootstrap" },
    });
  } else if (user.role !== "admin" || !user.active) {
    console.error(`${email} exists but is not an active admin.`);
    process.exitCode = 1;
    return;
  }

  const { token, expiresAt } = await createInvitation(email, user._id);
  await recordAudit({
    event: "code.issued",
    userId: user._id,
    email,
    detail: { issuedBy: "bootstrap", expiresAt },
  });

  console.log(`Invitation token for ${email}:`);
  console.log(token);
  console.log(`Expires at ${expiresAt.toISOString()}`);
}
