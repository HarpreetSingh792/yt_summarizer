import { JobModel } from "../../models/job.model.js";
import { addSummaryJob } from "../../queue/jobProducer.js";
import extractVideoId from "../../utils/validateURL.js";

export const summarizeVideo = async (req, res) => {
  const { url, language = "English" } = req.body;

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  

  const existing = await JobModel.findOne({
    videoId,
    status: "completed"
  });
  
  if (existing) {
    return existing; // return cached summary instantly
  }

  const job = await addSummaryJob({ videoId, language });

  res.status(202).json({
    jobId: job.id,
    status: "queued",
  });
};