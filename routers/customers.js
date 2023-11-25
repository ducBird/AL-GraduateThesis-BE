import express from "express";
import {
  activateEmail,
  deleteCartItemById,
  deleteCustomer,
  getAccessToken,
  getByIdCustomer,
  getCustomers,
  login,
  logout,
  postCustomer,
  registerCustomer,
  search,
  updateCartItemById,
  updateCustomer,
} from "../controllers/customers.js";
import { convertDateMiddleware } from "../middlewares/convertDate.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";

const router = express.Router();
router.get("/", getCustomers);
router.get("/:id", getByIdCustomer);
router.get("/search", search);
router.post("/", verifyTokenAdmin, convertDateMiddleware, postCustomer);
// router.patch("/:id", verifyToken, convertDateMiddleware, updateCustomer);
router.patch("/:id", updateCustomer);
// Cập nhật số lượng sản phẩm trong giỏ hàng
router.patch(
  "/:customerId/cart/:cartItemId",
  convertDateMiddleware,
  updateCartItemById
);

router.delete("/:id", verifyTokenAdmin, deleteCustomer);
// Xóa sản phẩm trong giỏ hàng
router.delete(
  "/:customerId/cart/:cartItemId",
  convertDateMiddleware,
  deleteCartItemById
);
router.post("/register", registerCustomer);
router.post("/activation", activateEmail);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);
router.get("/logout", logout);

export default router;
