import { Router } from "express";
import {
  registrationOptions,
  registrationVerify,
} from "../controllers/enrolment.js";

const router = Router();

router.post("/options", registrationOptions);
router.post("/verify", registrationVerify);

export default router;
