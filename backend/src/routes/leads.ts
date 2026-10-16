import { Router } from "express";
import { createLead, getLeads, saveContact } from "../controllers/leads.js";
import { requireAdmin } from "../middleware/auth.js";
import { contactLimiter, leadsLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", leadsLimiter, createLead);
router.post("/contact", contactLimiter, saveContact);
router.get("/", requireAdmin, getLeads);

export default router;
