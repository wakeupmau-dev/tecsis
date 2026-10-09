import { Router } from "express";
import { loginOptions, loginVerify, logout } from "../controllers/login.js";

const router = Router();

router.post("/login/options", loginOptions);
router.post("/login/verify", loginVerify);
router.post("/logout", logout);

export default router;
