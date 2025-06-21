import express from 'express';
import { signUpWithProfile, loginUser } from '../controllers/userController';

const router = express.Router();
router.post('/signup', signUpWithProfile);
router.post('/login', loginUser);

export default router;