import Auction from "../models/Auction.js";
import AutoBid from "../models/AutoBid.js";
import Bid from "../models/Bids.js";
import User from "../models/User.js";
import { SendOutBidEmail } from "./email.sender.js";

export const handleAutoBids = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId);

    if (!auction || auction.status !== "LIVE") return;

    const currentBid =
      auction.currentBid === 0
        ? auction.startingPrice - auction.minIncrement
        : auction.currentBid;

    const minIncrement = auction.minIncrement;

    const autoBidders = await AutoBid.find({
      auctionId,
      isActive: true,
    }).sort({ maxLimit: -1, createdAt: 1 });

    if (!autoBidders.length) return;

    let newBidPlaced = false;

    for (const bidder of autoBidders) {
      // Skip if already current winner
      if (String(bidder.userId) === String(auction.currentWinner))
        continue;

      const nextBid = currentBid + minIncrement;

      if (nextBid > bidder.maxLimit) {
        bidder.isActive = false;
        await bidder.save();

        const user = await User.findById(bidder.userId);
        if (user?.email) {
          await SendOutBidEmail(
            user.email,
            auction.item?.name,
            auction.currentBid,
            bidder.maxLimit,
            auctionId,
            auction.title
          );
        }

        continue;
      }

      const existingBid = await Bid.findOne({
        auctionId,
        userId: bidder.userId,
      });

      if (!existingBid) {
        await Bid.create({
          auctionId,
          userId: bidder.userId,
          amount: nextBid,
        });
      } else {
        existingBid.amount = nextBid;
        await existingBid.save();
      }

      bidder.lastBidAmount = nextBid;
      bidder.totalAutoBidsPlaced += 1;
      bidder.lastTriggeredAt = new Date();
      await bidder.save();

      const now = new Date();
      const timeDiff = auction.endTime - now;

      if (timeDiff <= 5 * 60 * 1000) {
        auction.endTime = new Date(
          auction.endTime.getTime() + 5 * 60 * 1000
        );
      }

      auction.currentBid = nextBid;
      auction.currentWinner = bidder.userId;
      auction.totalBids += 1;
      await auction.save();

      newBidPlaced = true;
      break; // Only one autobid per cycle
    }

    if (newBidPlaced) {
      await handleAutoBids(auctionId);
    }
  } catch (err) {
    console.error("Error handling auto-bids:", err.message);
  }
};
