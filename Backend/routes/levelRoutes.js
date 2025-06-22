import express from 'express'
import {
  updateUserProgress,
  getUserProgress,
  resetUserProgress,
} from '../controllers/levelController.js'

const router = express.Router()

// Complete a task and update user progress
router.post('/:userId/complete-task', updateUserProgress)

// Get user progress info: level, xp, stats, badges
router.get('/:userId/progress', getUserProgress)

// Reset user progress (dev/testing only)
router.delete('/:userId/reset', resetUserProgress)

export default router
