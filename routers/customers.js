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
  forgotPassword,
  resetPassword,
  changePassword,
  loginGoogleFailure,
  loginGoogleSuccess,
  deleteCustomerCart,
} from "../controllers/customers.js";
import { convertDateMiddleware } from "../middlewares/convertDate.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";
import passport from "passport";
import { FRONTLINE_URL } from "../constants/URLS.js";

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

router.delete("/delete-customer-cart/:id", deleteCustomerCart);

// Xóa sản phẩm trong giỏ hàng

router.delete(
  "/:customerId/cart/:productId/:variantId",
  convertDateMiddleware,
  deleteCartItemById
);
router.delete(
  "/:customerId/cart/:productId",
  convertDateMiddleware,
  deleteCartItemById
);
router.post("/register", registerCustomer);
router.post("/activation", activateEmail);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);
router.post("/forgot", forgotPassword);
router.post("/reset", verifyToken, resetPassword);
router.patch("/change/:id", verifyToken, changePassword);
router.get("/logout", logout);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONTLINE_URL}/user-profile`,
    // successRedirect: FRONTLINE_URL,
    failureRedirect: "/login/failed",
  })
);
//google auth
router.get("/login/failed", loginGoogleFailure);
router.get("/login/success", loginGoogleSuccess);

export default router;
