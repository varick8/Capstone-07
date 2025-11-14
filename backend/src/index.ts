import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import sensorRouter from "./routes/sensor";
import ispuRouter from "./routes/ispu";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import mergeRouter from "./routes/merge";

dotenv.config();

const app = express();

// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ["http://localhost:3000"];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or direct server requests)
    if (!origin) return callback(null, true);

    // Allow any Vercel deployment URLs (for testing)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("Capstone Backend Service!");
});

// API routes
app.use("/api/sensors", sensorRouter);
app.use("/api/merge", mergeRouter);
app.use("/api/ispu", ispuRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 8080;

// Only start the server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
