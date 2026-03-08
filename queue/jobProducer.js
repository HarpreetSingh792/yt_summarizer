import { Queue } from "bullmq";
// import { connection } from "./connection.js";
import { JobModel } from "../models/job.model.js";
import IORedis from "ioredis";


const connection = new IORedis(process.env.REDIS_URL || {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});
  export const summaryQueue = new Queue("summaryQueue", {
    connection
});

export async function addSummaryJob(data) {
    const job = await summaryQueue.add("summarize", data, {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
    });

    await JobModel.create({
        jobId: job.id,
        videoId: data.videoId,
        language: data.language,
        status: "queued",
    });

    return job;
}