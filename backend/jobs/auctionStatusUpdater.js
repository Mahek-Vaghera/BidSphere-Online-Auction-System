import cron from "node-cron";
import Auction from "../models/Auction.js";
import User from "../models/User.js";
import {
  SendAuctionWinnerEmail,
  SendSellerWinnerNotification,
} from "../services/email.sender.js";
import { logAuctionEvent } from "../services/logger.service.js";

let _cronJob = null;
let _isRunning = false;

const BATCH_SIZE = 200;

// logging
async function bulkLogAuctionEvents(auctionIds, eventType, details = {}) {
  const logBatchSize = 50;

  for (let i = 0; i < auctionIds.length; i += logBatchSize) {
    const batch = auctionIds.slice(i, i + logBatchSize);

    await Promise.allSettled(
      batch.map((auctionId) =>
        logAuctionEvent({
          auctionId,
          userId: null,
          userName: "SYSTEM",
          type: eventType,
          details: { triggeredAt: new Date(), ...details },
        })
      )
    );
  }
}

// status update
async function processStatusUpdateBatch(query, newStatus, eventType, details = {}) {
  let totalUpdated = 0;
  let lastId = null;
  let allIds = [];

  while (true) {
    const cursorQuery = lastId
      ? { ...query, _id: { $gt: lastId } }
      : query;

    const batch = await Auction.find(cursorQuery)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .select("_id")
      .lean();

    if (!batch.length) break;

    const ids = batch.map((a) => a._id);

    const result = await Auction.updateMany(
      { _id: { $in: ids } },
      { $set: { status: newStatus } }
    );

    totalUpdated += result.modifiedCount;
    allIds.push(...ids);

    lastId = batch[batch.length - 1]._id;

    if (batch.length < BATCH_SIZE) break;
  }

  if (allIds.length && totalUpdated > 0) {
    await bulkLogAuctionEvents(allIds, eventType, details);
  }

  return totalUpdated;
}

// winner assignment
async function assignWinnersForAuctions(auctionIds) {
  if (!auctionIds.length) return;

  await Promise.allSettled(
    auctionIds.map(async (id) => {
      try {
        // atomic check → prevents duplicate assignment
        const auction = await Auction.findOneAndUpdate(
          {
            _id: id,
            auctionWinner: { $in: [null, undefined] },
            currentWinner: { $ne: null },
          },
          {
            $set: {
              winningPrice: "$currentBid",
              auctionWinner: "$currentWinner",
            },
            $unset: {
              currentBid: "",
              currentWinner: "",
            },
          },
          { new: true }
        );

        if (!auction) return;

        const [winner, seller] = await Promise.all([
          User.findById(auction.auctionWinner),
          User.findById(auction.seller),
        ]);

        // send emails (non-blocking style)
        const emailTasks = [];

        if (winner) {
          emailTasks.push(
            SendAuctionWinnerEmail(
              winner.email,
              winner.username,
              auction.title,
              auction._id
            )
          );
        }

        if (seller) {
          emailTasks.push(
            SendSellerWinnerNotification(
              seller.email,
              seller.username,
              winner.username,
              auction.title,
              auction.winningPrice,
              listingFee,
              netEarnings,
              winner.address || "Not Provided"
            )
          );
        }

        await Promise.allSettled(emailTasks);
      } catch (err) {
        console.error("Winner assignment error:", err.message);
      }
    })
  );
}

// cron logic
async function updateAuctionStatuses() {
  if (_isRunning) return;

  _isRunning = true;
  const startTime = Date.now();
  const now = new Date();

  try {
    // UPCOMING → LIVE
    const toLiveCount = await processStatusUpdateBatch(
      {
        verified: true,
        status: "UPCOMING",
        startTime: { $lte: now },
        endTime: { $gt: now },
      },
      "LIVE",
      "AUCTION_STARTED"
    );

    // UPCOMING → ENDED
    const upcomingToEndedCount = await processStatusUpdateBatch(
      {
        verified: true,
        status: "UPCOMING",
        endTime: { $lte: now },
      },
      "ENDED",
      "AUCTION_ENDED",
      { reason: "Skipped LIVE phase" }
    );

    // LIVE → ENDED
    const endedAuctions = await Auction.find({
      verified: true,
      status: "LIVE",
      endTime: { $lte: now },
    })
      .select("_id")
      .lean();

    const toEndedCount = await processStatusUpdateBatch(
      {
        verified: true,
        status: "LIVE",
        endTime: { $lte: now },
      },
      "ENDED",
      "AUCTION_ENDED"
    );

    const endedIds = endedAuctions.map((a) => a._id);

    await assignWinnersForAuctions(endedIds);

    // handle missed ones
    const missed = await Auction.find({
      status: "ENDED",
      auctionWinner: { $in: [null, undefined] },
    })
      .select("_id")
      .lean();

    if (missed.length) {
      await assignWinnersForAuctions(missed.map((a) => a._id));
    }

    const duration = Date.now() - startTime;
    const total = toLiveCount + upcomingToEndedCount + toEndedCount;

    if (total > 0) {
      console.log(
        `[AuctionUpdater] ${total} updated (LIVE:${toLiveCount}, UPC→END:${upcomingToEndedCount}, LIVE→END:${toEndedCount}) in ${duration}ms`
      );
    }
  } catch (err) {
    console.error("[AuctionUpdater] Error:", err.message);
  } finally {
    _isRunning = false;
  }
}

//start/stop
export function startAuctionStatusUpdater({
  cronPattern = "*/1 * * * *",
  runOnStart = true,
} = {}) {
  if (_cronJob) return;

  if (!cron.validate(cronPattern)) {
    throw new Error("Invalid cron pattern");
  }

  if (runOnStart) {
    updateAuctionStatuses();
  }

  _cronJob = cron.schedule(
    cronPattern,
    () => {
      updateAuctionStatuses();
    },
    { scheduled: true, timezone: "UTC" }
  );

  console.log(`[AuctionUpdater] Started (${cronPattern})`);
}

export function stopAuctionStatusUpdater() {
  if (_cronJob) {
    _cronJob.stop();
    _cronJob = null;
    console.log("[AuctionUpdater] Stopped");
  }
}

export function getUpdaterStatus() {
  return {
    isRunning: Boolean(_cronJob),
    isProcessing: _isRunning,
  };
}