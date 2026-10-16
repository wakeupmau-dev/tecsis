import { rateLimit } from "express-rate-limit";

// Per IP, per form. Generous by default because visitors at a fair share one
// IP (venue Wi-Fi, the stand's tablet). RATE_LIMIT_PER_HOUR overrides it.
const LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR ?? 60);

export const leadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: LIMIT_PER_HOUR,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});

// Separate budget from leadsLimiter, so using the landing form doesn't use up
// the /products contact form.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: LIMIT_PER_HOUR,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
