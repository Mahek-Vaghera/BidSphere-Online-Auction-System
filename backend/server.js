import express from "express";
import cookieParser from "cookie-parser"; 
import dotenv from "dotenv"; 
dotenv.config(); 

// express app
const app = express();
app.set("trust proxy", true); 

//connect to db
import connectDB from "./services/db.service.js";

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed");
  });


//middlewares
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.json({ limit: "10mb" }));    
app.use(cookieParser()); 

import { restrictToLoggedinUserOnly, checkAuth } from "./middleware/authMiddleware.js"; 

// home page
app.get ("/", restrictToLoggedinUserOnly, (req, res) => res.send("BidSphere Online Auction System") );

// Auth Route
import authRoutes from "./routes/authRoutes.js";
app.use("/bidsphere/auth", authRoutes);

// Admin Route
import adminRoutes from "./routes/adminRoutes.js";
import { restrictAdminIP } from "./middleware/adminMiddleware.js";
app.use("/bidsphere/admin", restrictAdminIP, adminRoutes)

//Auction Route
import auctionRoutes from "./routes/auctionRoutes.js";
app.use("/bidsphere/auctions", auctionRoutes);

// Bid Route
import bidRoutes from "./routes/bidRoutes.js";
app.use("/BidSphere/auctions/:auctionId/bid", bidRoutes);

export default app;