import express from "express";
import { getSSE } from "../controllers/realtimeNotificationSSE.js";

const router = express.Router();
router.get("/customer-sse/:customer_id", getSSE);

export default router;
