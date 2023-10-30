import express from "express";
import "../config/dotenv.config.js";
const router = express.Router();
router.get("/", (req, res) => {
  return res.status(200).json({
    status: "OK",
    data: process.env.CLIENT_ID,
  });
});

export default router;
