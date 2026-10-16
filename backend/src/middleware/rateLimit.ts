import { rateLimit } from "express-rate-limit";

export const leadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});

// Separate budget from leadsLimiter, so using the landing form doesn't use up
// the /products contact form.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
