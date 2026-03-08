import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    videoId: { type: String, required: true },
    language: { type: String, default: "English" },

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },

    summary: { type: String },
    error: { type: String },

    transcriptLength: { type: Number },
  },
  { timestamps: true }
);

export const JobModel = mongoose.model("Job", jobSchema);