import mongoose from "mongoose";

const notificationEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    type: {
      type: String,
      required: true,
      enum: [
        "PAYMENT VERIFICATION",
        "WINNER_CHOOSE_COD_DELIVARY_PENDING",
        "WINNER CHOOSE UPI",
        "AUCTION VERIFICATION",
        "PAYMENT_SUCCESS_DELIVERY_PENDING"
      ],
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },

    status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "CONFIRM", "REJECT"],
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } 
);

// Parent schema: one per auction
const adminNotificationSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auction",
      required: true,
      unique: true, 
    },

    notifications: [notificationEntrySchema], 
  },
  { timestamps: true }
);

adminNotificationSchema.index({ "notifications.userId": 1 });

adminNotificationSchema.index({ "notifications.type": 1 });

export default mongoose.model("AdminNotification", adminNotificationSchema);