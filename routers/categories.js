import express from "express";
import {
  deleteCategory,
  getByIdCategory,
  getCategories,
  postCategory,
  search,
  updateCategory,
} from "../controllers/categories.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";
const router = express.Router();
router.get("/", getCategories);
router.get("/:id", getByIdCategory);
router.get("/search", search);
// router.post("/", verifyTokenAdmin, postCategory);
router.post("/", postCategory);
// router.patch("/:id", verifyToken, updateCategory);
router.patch("/:id", updateCategory);
// router.delete("/:id", verifyTokenAdmin, deleteCategory);
router.delete("/:id", deleteCategory);

export default router;
