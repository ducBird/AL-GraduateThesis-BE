import express from "express";
import {
  deleteProduct,
  getByIdProduct,
  getProducts,
  postProduct,
  search,
  updateProduct,
  getProductsByIdCategory,
  getProductsByIdSubCategory,
  searchProducts,
} from "../controllers/products.js";
import { convertDateMiddleware } from "../middlewares/convertDate.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/product/:id", getByIdProduct);
router.get("/:category_id", getProductsByIdCategory);
router.get("/:category_id/sub/:sub_category_id", getProductsByIdSubCategory);
router.get("/search", search);
router.post("/", verifyTokenAdmin, convertDateMiddleware, postProduct);
router.patch("/:id", verifyToken, convertDateMiddleware, updateProduct);
router.delete("/:id", verifyTokenAdmin, deleteProduct);
router.post("/search-products", searchProducts);

export default router;
