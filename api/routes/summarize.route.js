import { Router } from "express";
import { summarizeVideo } from "../controller/summarize.controller.js";

const router = Router();

router.post("/", summarizeVideo);

export default router;
