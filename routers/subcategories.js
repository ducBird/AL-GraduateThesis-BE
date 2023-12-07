import express from "express";
import {
  deleteSubCategory,
  getByIdSubCategory,
  getSubCategories,
  postSubCategory,
  search,
  updateSubCategory,
  getSubCategoriesByIdCategory,
} from "../controllers/sub.categories.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";

const router = express.Router();
router.get("/", getSubCategories);
router.get("/:category_id", getSubCategoriesByIdCategory);
router.get("/:category_id/:id", getByIdSubCategory);
router.get("/search", search);
router.post("/", postSubCategory);
router.patch("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
