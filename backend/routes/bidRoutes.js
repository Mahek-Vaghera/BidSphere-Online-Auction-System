import express from "express";
import { placeBid } from "../controllers/bidController.js";
import { 
  setAutoBid, 
  deactivateAutoBid, 
  activateAutoBid, 
  editAutoBid 
} from "../controllers/autoBidController.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js";
import { validateBid, validateAutoBid } from "../middleware/bidValidMiddleware.js";
import { validateRegistration } from  "../middleware/auctionRegistrationMiddleware.js" 

const router = express.Router({ mergeParams: true });

//bid
router.post("/place", restrictToLoggedinUserOnly,validateRegistration, validateBid, placeBid);

//autobid
router.post("/setauto", restrictToLoggedinUserOnly, validateRegistration, validateAutoBid, setAutoBid);

router.post("/editauto/:autobidId", restrictToLoggedinUserOnly, validateRegistration, validateAutoBid, editAutoBid);

router.post("/deactivateauto/:autobidId", restrictToLoggedinUserOnly, validateRegistration, deactivateAutoBid);

router.post("/activateauto/:autobidId", restrictToLoggedinUserOnly, validateRegistration, activateAutoBid);

export default router;