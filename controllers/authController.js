import Course from "../models/Course.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import EnhancedSubmission from "../models/EnhancedSubmission.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Save a YouTube video for a user
export const saveCourse = async (req, res) => {
  try {
    const { userId, title, videoId, channelTitle, thumbnail } = req.body;

    
    const newCourse = new Course({
      userId,
      title,
      videoId,
      channelTitle,
      thumbnail,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course saved successfully", course: newCourse });
  } catch (err) {
    res.status(500).json({ error: "Failed to save course" });
  }
};

// Get all saved courses for a specific user
export const getUserCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    const courses = await Course.find({ userId });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// Delete a saved course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password || !college) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
};

// Logout user
export const logout = async (req, res) => {
  // Since JWT is stateless, logout can be handled on client side by deleting token
  res.status(200).json({ message: "Logged out successfully" });
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, college, bio, profilePicture } = req.body;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name || user.name;
    user.college = college || user.college;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Add marks to user
export const addMarks = async (req, res) => {
  try {
    const user = req.user;
    const { examName, marks, totalMarks, percentage, date } = req.body;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!examName || marks == null || totalMarks == null || percentage == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    user.marks.push({ examName, marks, totalMarks, percentage, date });

    await user.save();

    res.status(200).json({ message: "Marks added successfully", marks: user.marks });
  } catch (err) {
    res.status(500).json({ error: "Failed to add marks" });
  }
};

// Delete marks from user
export const deleteMarks = async (req, res) => {
  try {
    const user = req.user;
    const { markId } = req.params;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.marks = user.marks.filter(mark => mark._id.toString() !== markId);

    await user.save();

    res.status(200).json({ message: "Marks deleted successfully", marks: user.marks });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete marks" });
  }
};

// Get user dashboard with exam history
export const getUserDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get detailed exam history from both submission models
    const [traditionalSubmissions, enhancedSubmissions] = await Promise.all([
      Submission.find({ userId: user._id })
        .populate('examId', 'title department semester')
        .sort({ submittedAt: -1 })
        .limit(10),
      EnhancedSubmission.find({ userId: user._id })
        .populate('examId', 'title subject difficulty')
        .sort({ submittedAt: -1 })
        .limit(10)
    ]);

    // Format traditional exam history
    const traditionalHistory = traditionalSubmissions.map(sub => ({
      id: sub._id,
      examName: sub.examId?.title || 'Traditional Exam',
      subject: sub.examId?.department || 'General',
      type: 'traditional',
      date: sub.submittedAt,
      status: 'Submitted (Pending Grading)',
      score: 0,
      totalQuestions: 0,
      percentage: 0
    }));

    // Format enhanced exam history
    const enhancedHistory = enhancedSubmissions.map(sub => ({
      id: sub._id,
      examName: sub.examId?.title || 'Enhanced Exam',
      subject: sub.examId?.subject || 'General',
      type: 'enhanced',
      date: sub.submittedAt,
      status: 'Completed',
      score: sub.score,
      totalQuestions: sub.results.length,
      percentage: sub.results.length > 0 ? (sub.score / sub.results.length) * 100 : 0
    }));

    // Combine and sort all exam history
    const examHistory = [...traditionalHistory, ...enhancedHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20); // Limit to 20 most recent

    // Calculate dashboard statistics
    const totalExams = examHistory.length;
    const completedExams = enhancedHistory.length;
    const averageScore = enhancedHistory.length > 0
      ? enhancedHistory.reduce((sum, exam) => sum + exam.percentage, 0) / enhancedHistory.length
      : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          college: user.college
        },
        marks: user.marks, // Automatically populated exam results
        examHistory,
        statistics: {
          totalExams,
          completedExams,
          pendingGrading: traditionalHistory.length,
          averageScore: Math.round(averageScore * 100) / 100
        }
      }
    });
  } catch (err) {
    console.error("Get user dashboard error:", err.message);
    res.status(500).json({
      success: false,
      error: `Failed to fetch dashboard: ${err.message}`
    });
  }
};
