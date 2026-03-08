import "../config/env.js";
import { Worker } from "bullmq";
import { processSummaryJob } from "../queue/jobWorker.js";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null } || {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});


const worker = new Worker("summaryQueue", processSummaryJob, {
    connection
});

console.log("🚀 Worker started...");

worker.on("completed", job => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});