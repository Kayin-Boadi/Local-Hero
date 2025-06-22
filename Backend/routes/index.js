import express from 'express';
import userRoutes from './userRoutes.js'; // User related routes
import questRoutes from './questRoutes.js'; // Quest related routes
import reviewRoutes from './reviewRoute.js'; // Review related route
import levelController from './levelRoutes.js'; // Leveling/Progress related routes

const router = express.Router();

router.use('/users', userRoutes); // Routes for user management
router.use('/quests', questRoutes); // Routes for quest management
router.use('/reviews', reviewRoutes); // Route for review management

export default router;
