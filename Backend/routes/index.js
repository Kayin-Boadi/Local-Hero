import express from 'express';
import userRoutes from './userRoutes.js'; // User related routes
import levelRoutes from './levelRoutes.js'; // Level related routes



const router = express.Router();

router.use('/users', userRoutes); // Routes for user management
router.use('/levels', levelRoutes); // Routes for level
export default router;
