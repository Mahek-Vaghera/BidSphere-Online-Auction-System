import AutoBid from "../models/AutoBid.js"
import Auction from "../models/Auction.js";
import User from "../models/User.js";
import { SendOutBidEmail } from "../services/email.sender.js";
import { handleAutoBids } from "../services/autoBid.service.js";
import { logAuctionEvent } from "../services/logger.service.js";

export const setAutoBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { maxLimit } = req.body;
    const userId = req.user._id;      

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    const baseBid = auction.currentBid === 0 
      ? auction.startingPrice 
      : auction.currentBid;

    if (!maxLimit || maxLimit < baseBid + auction.minIncrement) {
      return res.status(400).json({
        success: false,
        message: "Max limit must be greater than current bid + minimum increment"
      });
   }
      
    //Check if user already has an autobid for this auction
    const existingAutoBid = await AutoBid.findOne({ auctionId, userId });
    if (existingAutoBid) {
      return res.status(400).json({
      success: false,
      message: "Auto-bid already set for this auction" });
    }

    if (auction.status !== "LIVE") {
      return res.status(400).json({
        success: false,
        message: "Auto-bid can only be set on live auctions"
      });
    }

    const autobid = await AutoBid.create({
      auctionId: auctionId,
      userId: userId,
      maxLimit: maxLimit,
    });

    const bidder = await User.findById(userId);
    await logAuctionEvent({
      auctionId,
      userId: bidder._id,
      userName: bidder.username,
      type: "AUTO_BID_SET",
      details: { maxLimit, setAt: new Date() },
    });

   
    // push autobidder
    if (!auction.autoBidders.some(id => String(id) === String(userId))) {
      auction.autoBidders.push(userId);
      await auction.save();
    }
    
    await handleAutoBids(auctionId);

    return res.status(200).json(autobid);
  }
  catch (err) {
    console.error("Error setting auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const editAutoBid = async (req, res) => {
  try {
    const { maxLimit : newMaxLimit } = req.body; 
    const { autobidId } = req.params;

    if (!autobidId) {
      return res.status(400).json({
        success: false,
        message: "This Autobid is not in DB",
      });
    }

    const autobid = await AutoBid.findOne({
      _id: autobidId,
      userId: req.user._id
    });

    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status === "ENDED" || auction.status === "CANCELLED") {
      return res.status(404).json({
        success: false,
        message: "No updatation allowed for Autobid in this Auction",
      });
    }

    
    const baseBid = auction.currentBid === 0
      ? auction.startingPrice
      : auction.currentBid;

    if (!newMaxLimit || newMaxLimit < baseBid + auction.minIncrement) {
      return res.status(400).json({
        success: false,
        message: "New max limit must be greater than current bid + minimum increment"
      });
    }

    autobid.maxLimit = newMaxLimit;
    await autobid.save();

    const bidder = await User.findById(userId);
    await logAuctionEvent({
      auctionId,
      userId: bidder._id,
      userName: bidder.username,
      type: "AUTO_BID_UPDATED",
      details: { newLimit: newMaxLimit }, 
    });

    await handleAutoBids(auctionId);

    return res.status(200).json({
      success: true,
      message: "Auto-bid max limit updated successfully",
      data: autobid,
    });
  } 
  catch (err) {
    console.error("Error editing auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const activateAutoBid = async (req, res) => {
  try {
    const { auctionId, autobidId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status === "ENDED" || auction.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Auction not found or inactive" });
    }

    const autobid = await AutoBid.findOne({
      _id: autobidId,
      userId: req.user._id
    });
    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid record not found",
      });
    }

    if (autobid.isActive) {
      return res.status(200).json({
        success: true,
        message: "Auto-bid already active",
      });
    }

    const maxLimit = autobid.maxLimit;

    if (typeof maxLimit !== "number") {
      return res.status(400).json({
        success: false,
        message: "Numeric amount required",
      });
    }

    const baseBid = auction.currentBid === 0
    ? auction.startingPrice
    : auction.currentBid;

  if (!maxLimit || maxLimit < baseBid + auction.minIncrement) {

      const user = await User.findById(autobid.userId);

      if (user?.email) {
        await SendOutBidEmail(
          user.email,
          auction.item?.name,
          auction.currentBid,
          maxLimit,
          auction._id,
          auction.title
        );
      }

      return res.status(400).json({
        success: false,
        message: "Your maxLimit is too low",
      });
    }

    // Now activate (AFTER validation)
    autobid.isActive = true;
    await autobid.save();

    // Push into auction.autoBidders
    const alreadyExists = auction.autoBidders.some(
      (id) => id.toString() === autobid.userId.toString()
    );

    if (!alreadyExists) {
      auction.autoBidders.push(autobid.userId);
      await auction.save();
    }

    const bidder = await User.findById(userId);
    await logAuctionEvent({
      auctionId,
      userId: bidder._id,
      userName: bidder.username,
      type: "AUTO_BID_ACTIVATED",
      details: { activatedAt: new Date(), maxLimit: autobid.maxLimit },
    });

    // Trigger autobid engine
    await handleAutoBids(auctionId);

    return res.status(200).json({
      success: true,
      message: "Auto-bid activated successfully",
    });

  } catch (err) {
    console.error("Error activating auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deactivateAutoBid = async (req, res) => {
  try {
    const { auctionId, autobidId } = req.params;

    const existingAutoBid = await AutoBid.findOne({
      _id: autobidId,
      userId: req.user._id
    });
    if (!existingAutoBid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    if (existingAutoBid.isActive === false) {
      return res.status(200).json({
        success: true,
        message: "Auto-bid is already deactivated",
      });
    }

    existingAutoBid.isActive = false;
    await existingAutoBid.save();

    await Auction.findByIdAndUpdate(
      auctionId,
      { $pull: { autoBidders: existingAutoBid.userId } }
    );

    const bidder = await User.findById(userId);
    await logAuctionEvent({
      auctionId,
      userId: bidder._id,
      userName: bidder.username,
      type: "AUTO_BID_DEACTIVATED",
      details: { deactivatedAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: "Auto-bid cancelled successfully",
    });
  } 
  catch (err) {
    console.error("Error cancelling auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};  