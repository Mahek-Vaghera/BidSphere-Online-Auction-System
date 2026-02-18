import express from "express";
import { placeBid } from "../controllers/bidController.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js";
import { validateBid} from "../middleware/bidValidMiddleware.js";
import { validateRegistration } from  "../middleware/auctionRegistrationMiddleware.js" 

const router = express.Router({ mergeParams: true });

//bid
router.post("/place", restrictToLoggedinUserOnly,validateRegistration, validateBid, placeBid);


export default router;