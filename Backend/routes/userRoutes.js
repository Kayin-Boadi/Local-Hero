import express from 'express';
import {
  signUpWithProfile,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

// Auth routes
router.post('/signup', signUpWithProfile);
router.post('/login', loginUser);

// Profile routes
router.get('/users/:id', getUserProfile);       // GET user profile by ID
router.patch('/users/:id', updateUserProfile);  // Update user profile
router.get('/users', getAllUsers);              // List all users (for leaderboard/admin)

export default router;
