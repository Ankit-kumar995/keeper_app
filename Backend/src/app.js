import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// 1. CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parser (JWT cookies ke liye)
app.use(cookieParser());

// 4. Basic Route
app.get("/", (req, res) => {
  res.send("Keeper App Backend is running successfully!");
});

// 5. Routes
app.use("/api/auth",      authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 6. Error Handler
app.use(errorHandler);

export default app;