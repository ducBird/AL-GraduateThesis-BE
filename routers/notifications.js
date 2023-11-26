import express from "express";
import {
  deleteNotification,
  getByIdNotification,
  getNotifications,
  postNotification,
  search,
  updateNotification,
} from "../controllers/notifications.js";

const router = express.Router();
router.get("/", getNotifications);
router.get("/:id", getByIdNotification);
router.get("/search", search);
// router.post("/", verifyTokenAdmin, postCategory);
router.post("/", postNotification);
// router.patch("/:id", verifyToken, updateCategory);
router.patch("/:id", updateNotification);
// router.delete("/:id", verifyTokenAdmin, deleteCategory);
router.delete("/:id", deleteNotification);

export default router;
