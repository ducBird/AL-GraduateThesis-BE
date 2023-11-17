import express from "express";
import {
  getAccumulatedMoney,
  getByIdAccumulatedMoney,
  postAccumulatedMoney,
  updateAccumulatedMoney,
  deleteAccumulatedMoney,
  search,
} from "../controllers/accumulated.money.js";
// import {
//   verifyToken,
//   verifyTokenAdmin,
// } from "../middlewares/middlewareauth.js";
const router = express.Router();
router.get("/", getAccumulatedMoney);
router.get("/:id", getByIdAccumulatedMoney);
router.get("/search", search);
router.post("/", postAccumulatedMoney);
router.patch("/:id", updateAccumulatedMoney);
router.delete("/:id", deleteAccumulatedMoney);

export default router;
