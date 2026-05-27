import express from "express";

import {
  googleLogin,
  getMe,
  logout,
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GOOGLE LOGIN
router.post("/google", googleLogin);

// EMAIL REGISTER
router.post("/register", registerUser);

// EMAIL LOGIN
router.post("/login", loginUser);

// CURRENT USER
router.get("/me", protect, getMe);

// LOGOUT
router.post("/logout", logout);

export default router;