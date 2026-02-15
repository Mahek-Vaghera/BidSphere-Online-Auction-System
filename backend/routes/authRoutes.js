import express from "express";
const router = express.Router();

import { handleRegister , handleLogin, handleLogout, verifyEmail, handleResetPwdEmail, handleResetPwd } from "../controllers/authController.js";

router.post("/register", handleRegister);
router.post("/verifyemail", verifyEmail);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

router.post("/forgetpwd", handleResetPwdEmail);
router.post("/resetpwd", handleResetPwd);

export default router;