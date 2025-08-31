const express = require('express');
const router = express.Router();
const { generateTopicQuiz } = require('../controllers/topicQuizController');

router.post('/generate-quiz', generateTopicQuiz);

module.exports = router;