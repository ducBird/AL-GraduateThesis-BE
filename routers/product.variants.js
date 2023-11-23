import express from "express";
import {
  deleteProductVariant,
  getByIdProductVariant,
  getProductVariants,
  postProductVariant,
  search,
  updateProductVariant,
  getVariantsByProductId,
  getVariant,
  deleteAllVariant,
  updateVariant,
} from "../controllers/product.variants.js";

const router = express.Router();
router.get("/", getProductVariants);
router.get("/:product_id", getVariantsByProductId);
// router.get("/:product_id/:id", getByIdProductVariant);
// router.get("/variant/:id", getVariant);
// router.get("/search", search);
router.post("/", postProductVariant);
router;
router.put("/updateVariants", updateProductVariant);
router.patch("/:id", updateVariant);
router.delete("/:id", deleteProductVariant);
router.delete("/", deleteAllVariant);

export default router;
