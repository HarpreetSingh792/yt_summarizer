// import "../config/env.js";
import mongoose from "mongoose";


export const connectDB = () => {
  console.log("Mongo URI: ", process.env.MONGO_URI);
  mongoose.connect(process.env.MONGO_URI,{
    dbName: "ytsummarizer",
  }).then(() => {
    console.log("MongoDB connected");
  }).catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
};