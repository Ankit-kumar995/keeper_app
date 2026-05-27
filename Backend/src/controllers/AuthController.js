import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= TOKEN GENERATE =================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ FIX: Ek helper - saari jagah same options, path: "/" add kiya
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture: profilePic,
    } = payload;

    let user = await User.findOne({ googleId }) || await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePic,
        googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.profilePic = profilePic;
      await user.save();
    }

    const token = generateToken(user);

    res.cookie("token", token, cookieOptions()); // ✅ FIX

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: userObj,
      token,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({
      message: "Google authentication failed",
    });
  }
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.cookie("token", token, cookieOptions()); // ✅ FIX

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      user: userObj,
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please sign in with Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, cookieOptions()); // ✅ FIX

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      user: userObj,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // ✅ ASLI FIX - yeh missing tha
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};