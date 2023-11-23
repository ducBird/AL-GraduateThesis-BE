import express from "express";
import {
  deleteProductAttribute,
  getByIdProductAttribute,
  getProductAttributes,
  postProductAttribute,
  search,
  updateProductAttribute,
  getAttributesByProductId,
  getAttribute,
  deleteAllAttribute,
} from "../controllers/product.attribute.js";

const router = express.Router();
router.get("/", getProductAttributes);
router.get("/:product_id", getAttributesByProductId);
router.get("/:product_id/:id", getByIdProductAttribute);
router.get("/attribute/:id", getAttribute);
router.get("/search", search);
router.post("/", postProductAttribute);
router.put("/updateAttributes", updateProductAttribute);
router.delete("/:id", deleteProductAttribute);
router.delete("/", deleteAllAttribute);

export default router;
