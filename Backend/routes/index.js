import express from 'express';
import userRoutes from './userRoutes.js'; // User related routes

const router = express.Router();

router.use('/users', userRoutes); // Routes for user management

export default router;
