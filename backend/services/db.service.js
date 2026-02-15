import mongoose from "mongoose";
import 'dotenv/config'; 
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI)
      console.log("database connected");
    } catch (error) {
      console.log("config error");
    }
}

export default connectDB;