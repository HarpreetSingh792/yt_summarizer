import "./config/env.js";
import express from "express";
import cors from "cors";
import server from "./server.js";
import summarizeRoute from "./api/routes/summarize.route.js";
import jobRoute from "./api/routes/job.route.js";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";



//temp to decline the self signed certificate error
// TODO: Remove this in production
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter (only for summarize endpoint)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

// Routes
app.use("/api/v1/summarize", limiter, summarizeRoute);
app.use("/api/v1/jobs", jobRoute);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Connect to MongoDB
// connectDB();
// Server
const PORT = process.env.PORT || 3000;
server(app, PORT);