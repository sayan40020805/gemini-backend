import express from 'express';
import {
  getEnhancedCourses,
  getCoursesByLanguage,
  getCourseWithCertificates,
  createEnhancedCourse,
  linkCertificateCourse,
  getCertificateCourses,
  createCertificateCourse
} from '../controllers/enhancedCourseController.js';

const router = express.Router();

// Enhanced Course Routes
router.get('/enhanced-courses', getEnhancedCourses);
router.get('/enhanced-courses/language/:language', getCoursesByLanguage);
router.get('/enhanced-courses/:id', getCourseWithCertificates);
router.post('/enhanced-courses', createEnhancedCourse);
router.post('/enhanced-courses/link-certificate', linkCertificateCourse);

// Certificate Course Routes
router.get('/certificate-courses', getCertificateCourses);
router.post('/certificate-courses', createCertificateCourse);

export default router;