import express from "express";
import cors from "cors";

// Initialize the app
const app = express();

// DOTENV CONFIG
require("dotenv").config();

const allowedOrigins = ['http://localhost:3000'];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse incoming JSON requests and make the data available in req.body

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'], // Allow only specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow only these headers
  credentials: true // Allow cookies to be sent
}));

// Define routes
app.get("/", (req, res) => {
  res.send("Capstone Backend Service!");
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
