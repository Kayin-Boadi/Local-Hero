import express from 'express';
import { signUpWithProfile, loginUser } from '../controllers/userController.js';

const router = express.Router();
router.post('/signup', (req, res, next) => {
  console.log('🛬 Incoming POST /signup');
  next();
}, signUpWithProfile);
router.post('/login', loginUser);

export default router;