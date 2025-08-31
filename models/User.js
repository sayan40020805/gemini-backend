import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  marks: [marksSchema],
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Check if the model already exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;