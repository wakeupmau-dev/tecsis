import { Router } from "express";
import { createLead, getLeads } from "../controllers/leads.js";
import { requireAdmin } from "../middleware/auth.js";
import { leadsLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", leadsLimiter, createLead);
router.get("/", requireAdmin, getLeads);

export default router;
