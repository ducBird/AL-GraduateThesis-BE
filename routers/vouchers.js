import express from "express";
import {
  getVouchers,
  getByIdVoucher,
  postVoucher,
  updateVoucher,
  deleteVoucher,
  search,
} from "../controllers/vouchers.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";
const router = express.Router();
router.get("/", getVouchers);
router.get("/:id", getByIdVoucher);
router.get("/search", search);
router.post("/", postVoucher);
router.patch("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

export default router;
