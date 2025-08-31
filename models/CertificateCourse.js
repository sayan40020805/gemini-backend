import mongoose from "mongoose";

const certificateCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  courseUrl: {
    type: String,
    required: true,
  },
  certificateUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  level: {
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
  rating: {
    type: Number,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
}, { timestamps: true });

// Check if the model already exists to prevent OverwriteModelError
const CertificateCourse = mongoose.models.CertificateCourse || mongoose.model("CertificateCourse", certificateCourseSchema);
export default CertificateCourse;