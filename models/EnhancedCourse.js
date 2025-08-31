import mongoose from "mongoose";

const enhancedCourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    prerequisites: [String],
    outcomes: [String],
    linkedCertificateCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CertificateCourse",
      },
    ],
    syllabus: [
      {
        topic: String,
        duration: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

// Check if the model already exists to prevent OverwriteModelError
const EnhancedCourse = mongoose.models.EnhancedCourse || mongoose.model("EnhancedCourse", enhancedCourseSchema);
export default EnhancedCourse;