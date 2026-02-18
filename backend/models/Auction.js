import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    status: {
      type: String,
      enum: [
        "YET_TO_BE_VERIFIED",
        "UPCOMING",
        "LIVE",
        "ENDED",
        "CANCELLED",
        "REMOVED",
      ],
      default: "YET_TO_BE_VERIFIED",
    },
    verified: {
      type: Boolean,
      default: false,
    },

    startingPrice: {
      type: Number,
      required: true,
    },
    minIncrement: {
      type: Number,
      required: true,
    },
    ByitNowPrice: {
      type: Number
    },

    currentBid: {
      type: Number,
      default: 0,
    },
    currentWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },

    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },

    autoBidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    isRegistrationOpen: {
      type: Boolean,
      default: false,
    },

    auctionWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    winningPrice: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi"],
    },

    totalBids: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },

    sellerRating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Query: find live auctions ending soon
auctionSchema.index({ status: 1, endTime: 1 }); 

// Query: find auctions by creator
auctionSchema.index({ createdBy: 1 });

// Query: find upcoming auctions
auctionSchema.index({ startTime: 1 });

// Query: find auction for a specific product
auctionSchema.index({ product: 1 });

// Query: find ended auctions by creator, sorted by end time
auctionSchema.index({ createdBy: 1, status: 1, endTime: -1 });

// Query: find top active auctions
auctionSchema.index({ totalBids: -1 });

// Query: find auctions a user registered for
auctionSchema.index({ registrations: 1 });

// Query: find auctions a user has won
auctionSchema.index({ auctionWinner: 1 });

// Query: find all auctions where user is current highest bidder
auctionSchema.index({ currentWinner: 1 });

// Query: find old ended auctions for cleanup/archive
auctionSchema.index({ endTime: 1, status: 1 });

const Auction = mongoose.model("auction", auctionSchema);

export default Auction;