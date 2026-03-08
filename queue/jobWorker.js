import { getTranscript } from "../services/transcript.service.js";
import { summarizeText } from "../services/llm.service.js";
import { JobModel } from "../models/job.model.js";

export async function processSummaryJob(job) {
  const { videoId, language } = job.data;

  try {
    // 1️⃣ Mark job as processing
    await JobModel.findOneAndUpdate(
      { jobId: job.id },
      { status: "processing" }
    );

    // 2️⃣ Extract transcript
    const transcript = await getTranscript(videoId);

    console.log("Transcript length:", transcript?.length);
    console.log("Transcript preview:", transcript?.slice(0, 200));

    if (!transcript || transcript.length < 200) {
      throw new Error("Transcript unavailable or too short");
    }



    // 4️⃣ Summarize (chunking handled in llm.service)
    const summary = await summarizeText(transcript, language);

    // 5️⃣ Save result in MongoDB
    await JobModel.findOneAndUpdate(
      { jobId: job.id },
      {
        status: "completed",
        summary,
        transcriptLength: transcript.length,
        error: null,
      }
    );

    return summary;

  } catch (error) {

    // 6️⃣ Mark job failed
    await JobModel.findOneAndUpdate(
      { jobId: job.id },
      {
        status: "failed",
        error: error.message,
      }
    );

    throw error; // let BullMQ handle retry
  }
}