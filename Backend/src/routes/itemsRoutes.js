import express from "express";
import {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/",       protect, getItems);
router.post("/",      protect, upload.fields([
  { name: "warrantyCard",  maxCount: 1 },
  { name: "invoice",       maxCount: 1 },
  { name: "productImage",  maxCount: 1 },
]), createItem);
router.get("/:id",    protect, getItemById);
router.put("/:id",    protect, upload.fields([
  { name: "warrantyCard",  maxCount: 1 },
  { name: "invoice",       maxCount: 1 },
  { name: "productImage",  maxCount: 1 },
]), updateItem);
router.delete("/:id", protect, deleteItem);

export default router;