import "dotenv/config"; // Load environment variables first!
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import geminiRoutes from "./routes/geminiRoutes.js";
import deepseekRoutes from "./routes/deepseekRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import enhancedCourseRoutes from "./routes/enhancedCourseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import enhancedExamRoutes from "./routes/enhancedExamRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5176', 'http://localhost:5176', 'https://your-frontend-domain.com'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

connectDB(); // Call the DB connection function

// Route Handlers
app.use("/api/gemini", geminiRoutes);
app.use("/api/deepseek", deepseekRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/enhanced-exams", enhancedExamRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api", enhancedCourseRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("🎉 Welcome to the Backend API (Gemini + YouTube + Enhanced Courses)");
});

// Optional Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn("⚠️  Missing YOUTUBE_API_KEY in .env file.");
  }
});