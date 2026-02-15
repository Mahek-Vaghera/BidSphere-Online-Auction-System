import express from "express";
const router = express.Router();
import { adminLogin, adminLogout} from "../controllers/adminController.js";

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

export default router;