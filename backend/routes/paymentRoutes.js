import express from "express";
import { handleRegistrationPayment, verifyPayment, handleWinningUpiPayment} from "../controllers/paymentController.js"
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js";   
const router = express.Router();

router.post("/:auctionId/au-registration/pay", restrictToLoggedinUserOnly, handleRegistrationPayment);

router.post("/:auctionId/:paymentId/verify", restrictToLoggedinUserOnly, verifyPayment);

router.post("/:auctionId/finalpay/upi", restrictToLoggedinUserOnly, handleWinningUpiPayment);

export default router;