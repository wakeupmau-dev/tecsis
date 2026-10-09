import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import adminRouter from "./routes/admin.js";
import enrolmentRouter from "./routes/enrolment.js";
import leadsRouter from "./routes/leads.js";
import loginRouter from "./routes/login.js";
import { logError } from "./lib/errorLog.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT ?? 4000);
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) throw new Error("MONGO_URL is not set");

process.on("unhandledRejection", handleFatal);
process.on("uncaughtException", handleFatal);

async function handleFatal(error: unknown) {
  await logError(error, { context: { source: "process" } });
  process.exit(1);
}

app.use(express.json());
app.use(cookieParser());

app.get("/", handleRoot);
app.use("/api/leads", leadsRouter);
app.use("/api/auth/enrol", enrolmentRouter);
app.use("/api/auth", loginRouter);
app.use("/api/admin", adminRouter);
app.use(errorHandler);

function handleRoot(_req: Request, res: Response) {
  res.json({ status: "ok" });
}

await mongoose.connect(MONGO_URL);
app.listen(PORT, handleListen);

function handleListen(error?: Error) {
  if (error) throw error;
  console.log(`Server running on http://localhost:${PORT}`);
}
