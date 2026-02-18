import Auction from "../models/Auction.js";
import Product from "../models/Product.js";
import AdminNotification from "../models/AdminNotification.js";

//POST /bidsphere/auctions/create
async function createAuction(req, res) {
  try {
    const {
      title,
      startingPrice,
      minIncrement,
      ByitNowPrice,
      startTime,
      endTime,
    }=req.body;

    const userId = req.user._id;
    const start = new Date(startTime);
    const end = new Date(endTime);
    // New auctions start as "YET_TO_BE_VERIFIED" until admin verifies them
    const status = "YET_TO_BE_VERIFIED";

    const now = new Date();
    const regOpenTime = new Date(start.getTime() - 24 * 60 * 60 * 1000);

    let isRegistrationOpen = now >= regOpenTime && now < start;

    // create product
    const product = await Product.create(req.productData)

    // create auction
    const auction = await Auction.create({
      title: String(title).trim(),
      product: product,
      createdBy: userId,
      status,
      verified: false,
      startingPrice: Number(startingPrice),
      minIncrement: Number(minIncrement),
      ByitNowPrice,
      currentBid: 0,
      startTime: start,
      endTime: end,
      autoBidders: [],
      registrations: [],
      isRegistrationOpen,
      totalBids: 0,
      totalParticipants: 0,
    });

    product.auctionId = auction._id;
    await product.save();

    //admin notification send
    await AdminNotification.create({ //this on right place 
      auctionId: auction._id, 
      userId,
      type: "AUCTION VERIFICATION",
      status: "PENDING"
    })

    return res.status(201).json({
      success: true,
      message: "Auction created successfully",
      auction,
    });
  } catch (err) {
    console.error("createAuction error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

//GET /bidsphere/auctions/mine
async function getMyAuctions(req, res) {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { createdBy: userId };
    if (status) filter.status = status.toUpperCase();

    const skip=(Number(page) - 1) * Number(limit);

    const auctions=await Auction.find(filter)
      .sort({createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("title item.name item.images startTime endTime currentBid status startingPrice totalBids")
      .lean();

    const total = await Auction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      auctions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getMyAuctions error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

//GET /bidsphere/auctions
async function listAuctions(req, res) {
  try {
    const { status, category, search, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    const filter = { verified: true }; // Only show verified auctions to public
    if (status) filter.status = status.toUpperCase();
    if (category) filter["item.category"] = category;

    // If search is provided, perform a case-insensitive regex search across several fields
    if (search && String(search).trim()) {
      // escape regex special chars
      const esc = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(esc, "i");
      filter.$or = [
        { title: re },
        { "item.name": re },
        { "item.description": re },
        { "item.category": re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const auctions = await Auction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select("title item.name item.images startTime endTime currentBid status startingPrice totalBids")
      .populate("createdBy", "username")
      .lean();

    const total = await Auction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      auctions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("listAuctions error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

//PUT /bidsphere/auctions/:auctionId
async function editAuction(req, res)  {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;
    const updates = req.validUpdates;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this auction",
      });
    }

    // edit info only before 1 day of auction start
    const now = new Date();
    const timeDifference = auction.startTime - now; 
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 1) {
      return res.status(400).json({
        success: false,
        message: "You can only edit auction details up to 1 day before it starts.",
      });
    }

    // update auction
    const updatedAuction = await Auction.findByIdAndUpdate(
      auctionId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Auction updated successfully",
      auction: updatedAuction,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating auction",
      error: err.message,
    });
  }
};

//DELETE /bidsphere/auctions/:auctionId
async function deleteAuction(req, res) {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this auction" });
    }

    // delete auction is only allowed before 1 days of auction starts
    const now = new Date();
    const timeDifference = auction.startTime - now; // in ms
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 1) {
      return res.status(400).json({
        success: false,
        message: "You can only delete auction up to 1 days before it starts.",
      });
    }

    // delete - not actually 
    await Auction.findByIdAndUpdate(
      auctionId,
      { $set: { status: "CANCELLED" } },
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

async function liveAuction (req, res) {
  try {
    const now = new Date();

    const auctions = await Auction.find({
      status: "LIVE",
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
    .populate("product")
    .populate("createdBy")
    .populate("currentBid")
    .sort({ endTime: 1 }); // ending soon first

    return res.status(200).json({
      success: true,
      count: auctions.length,
      auctions,
    });

  } catch (error) {
    console.error("Live auction error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

async function upcomingAuction (req, res) {
  try {
    const now = new Date();

    const auctions = await Auction.find({
      status: "UPCOMING",
      startTime: { $gt: now }, // future auctions only
    })
      .populate("product")
      .populate("createdBy", "name email")
      .sort({ startTime: 1 }); // starting soon first

    return res.status(200).json({
      success: true,
      count: auctions.length,
      auctions,
    });

  } catch (error) {
    console.error("Upcoming auction error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

async function endedAuction (req, res) {
  try {
    const now = new Date();

    const auctions = await Auction.find({
      status: "ENDED",
      endTime: { $lt: now }, // auction time already over
    })
      .populate("product")
      .populate("auctionWinner", "name email")
      .sort({ endTime: -1 }); // recently ended first

    return res.status(200).json({
      success: true,
      count: auctions.length,
      auctions,
    });

  } catch (error) {
    console.error("Ended auction error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export {
  createAuction,
  getMyAuctions,
  listAuctions,
  editAuction,
  deleteAuction,
  liveAuction,
  upcomingAuction,
  endedAuction
};