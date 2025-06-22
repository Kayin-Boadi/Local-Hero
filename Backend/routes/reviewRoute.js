import express from 'express';
import { submitReview } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/submit', submitReview);

export default router;
