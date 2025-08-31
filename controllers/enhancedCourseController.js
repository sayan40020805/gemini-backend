import EnhancedCourse from '../models/EnhancedCourse.js';
import CertificateCourse from '../models/CertificateCourse.js';

// Get all enhanced courses with optional filtering
export const getEnhancedCourses = async (req, res) => {
  try {
    const { language, category, difficulty, department } = req.query;
    let query = {};

    if (language) query.language = language;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (department) query.department = department;

    const courses = await EnhancedCourse.find(query)
      .populate('linkedCertificateCourses')
      .sort({ courseCode: 1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get courses by programming language
export const getCoursesByLanguage = async (req, res) => {
  try {
    const { language } = req.params;
    const courses = await EnhancedCourse.find({ language })
      .populate('linkedCertificateCourses')
      .sort({ semester: 1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single course with certificate courses
export const getCourseWithCertificates = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await EnhancedCourse.findById(id)
      .populate('linkedCertificateCourses');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new enhanced course
export const createEnhancedCourse = async (req, res) => {
  try {
    const course = new EnhancedCourse(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Link certificate course to enhanced course
export const linkCertificateCourse = async (req, res) => {
  try {
    const { courseId, certificateCourseId } = req.body;

    const course = await EnhancedCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const certificateCourse = await CertificateCourse.findById(certificateCourseId);
    if (!certificateCourse) {
      return res.status(404).json({ error: 'Certificate course not found' });
    }

    if (!course.linkedCertificateCourses.includes(certificateCourseId)) {
      course.linkedCertificateCourses.push(certificateCourseId);
      await course.save();
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all certificate courses
export const getCertificateCourses = async (req, res) => {
  try {
    const { language, platform, level } = req.query;
    let query = { isFree: true };

    if (language) query.language = language;
    if (platform) query.platform = platform;
    if (level) query.level = level;

    const courses = await CertificateCourse.find(query)
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create certificate course
export const createCertificateCourse = async (req, res) => {
  try {
    const course = new CertificateCourse(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};