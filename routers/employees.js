import express from "express";
import {
  deleteEmployee,
  getByIdEmployee,
  getEmployees,
  login,
  postEmployee,
  search,
  updateEmployee,
  getAccessToken,
} from "../controllers/employees.js";
import { convertDateMiddleware } from "../middlewares/convertDate.js";
import {
  verifyToken,
  verifyTokenAdmin,
} from "../middlewares/middlewareauth.js";

const router = express.Router();
router.get("/", verifyToken, getEmployees);
router.get("/:id", getByIdEmployee);
router.get("/search", search);
router.post("/", verifyTokenAdmin, convertDateMiddleware, postEmployee);
router.patch("/:id", verifyTokenAdmin, convertDateMiddleware, updateEmployee);
router.delete("/:id", verifyTokenAdmin, deleteEmployee);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);

export default router;
