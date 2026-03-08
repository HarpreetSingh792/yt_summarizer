import { JobModel } from "../../models/job.model.js";

export const getJobStatus = async (req, res) => {
  const job = await JobModel.findOne({ jobId: req.params.id });

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
};