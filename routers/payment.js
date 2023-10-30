import express from "express";
import { PaymentVNPay } from "../controllers/payment.js";
import { PaymentMOMO } from "../controllers/payment.momo.js";
const router = express.Router();
router.post("/create_paymentVnpay_url", PaymentVNPay);
router.post("/create_paymentMoMo_url", PaymentMOMO);

// router.get("/https://google.com/");
// router.get("/", getCategories);
export default router;
