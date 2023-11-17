import express from "express";
import {
  getOrder,
  getOrderId,
  postOrder,
  deleteOrder,
  updateOrder,
  queryOne,
  queryOrderStatusFromdaytoday,
  orderByPaymentInformation,
  orderByStatus,
  orderByPaymentStatus,
} from "../controllers/orders.js";

const router = express.Router();
router.get("/", getOrder);
router.get("/:id", getOrderId);
router.post("/", postOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.post("/query-order-by-payment_information", orderByPaymentInformation);
router.post("/query-order-payment_status", orderByPaymentStatus);
router.post("/query-one", queryOne);
router.post("/query-order-by-status", orderByStatus);
router.post(
  "/query-trangthaidonhang-tu-ngay-den-ngay",
  queryOrderStatusFromdaytoday
);

export default router;
