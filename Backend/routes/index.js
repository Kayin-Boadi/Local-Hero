import express from 'express';
import userRoutes from './userRoutes.js'; // User related routes
import questRoutes from './questRoutes.js'; // Quest related routes

const router = express.Router();

router.use('/users', userRoutes); // Routes for user management
router.use('/quests', questRoutes); // Routes for quest management

export default router;
