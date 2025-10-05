import express from 'express';
const router = express.Router();
import { saveTopicQuizResult, getTopicQuizHistory } from '../controllers/topicQuizController.js';

router.post('/save-result', saveTopicQuizResult);
router.get('/user/:userId/history', getTopicQuizHistory);

export default router;
