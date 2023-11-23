import express from "express";
// import { uploadImageMiddleware } from "../middlewares/uploadImage.js";
import uploadCloud from "../config/cloudinary.config.js";
import { uploadImage } from "../controllers/upload.js";

const router = express.Router();

router.post("/:collectionName/:id", uploadCloud.single("file"), uploadImage);
// router.post(
//   "/multiple/:collectionName/:id",
//   uploadCloud.array("files", 10),
//   uploadMultipleImage
// );

export default router;
