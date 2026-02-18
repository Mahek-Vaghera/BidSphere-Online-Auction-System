import express from "express";
const router = express.Router();

import {createAuction, getMyAuctions, listAuctions, editAuction, deleteAuction, liveAuction, upcomingAuction, endedAuction} from "../controllers/auctionController.js";
import { validateCreateAuction , validateUpdateAuction } from "../middleware/auctionValidMiddleware.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js";


router.post("/create", restrictToLoggedinUserOnly, validateCreateAuction, createAuction);
router.get("/mine", restrictToLoggedinUserOnly, getMyAuctions);
router.get("/", listAuctions);
router.put("/:auctionId", restrictToLoggedinUserOnly, validateUpdateAuction, editAuction);
router.delete("/:auctionId", restrictToLoggedinUserOnly, deleteAuction);

router.get("/live", liveAuction);
router.get("/upcoming", upcomingAuction);
router.get("/ended", endedAuction);

export default router;