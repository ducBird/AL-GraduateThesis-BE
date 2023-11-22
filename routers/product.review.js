import express from "express";

import { convertDateMiddleware } from "../middlewares/convertDate.js";

import {
  deleteAllProductReview,
  deleteProductReview,
  getByIdProductReview,
  getProductsReview,
  postProductReview,
  search,
  updateProductReview,
} from "../controllers/product.review.js";

const router = express.Router();
router.get("/", getProductsReview);
router.get("/:id", getByIdProductReview);
router.get("/search", search);
router.post("/", convertDateMiddleware, postProductReview);
router.patch("/:id", convertDateMiddleware, updateProductReview);
router.delete("/:id", deleteProductReview);
router.delete("/", deleteAllProductReview);

export default router;
