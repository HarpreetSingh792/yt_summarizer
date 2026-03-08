import { Router } from "express";
import { getJobStatus } from "../controller/jobStatus.controller.js";

const router = Router();

router.get("/:id", getJobStatus);

export default router;