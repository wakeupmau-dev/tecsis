import { Router } from "express";
import {
  createUser,
  issueInvitation,
  listErrors,
  revokeCredential,
} from "../controllers/admin.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAdmin);

router.post("/users", createUser);
router.post("/invitations", issueInvitation);
router.delete("/users/:id/credential", revokeCredential);
router.get("/errors", listErrors);

export default router;
