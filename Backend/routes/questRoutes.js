import express from 'express';
import {
  createQuest,
  offerToHelp,
  approveHeroOffer,
  getPendingOffersForQuest,
  getOpenQuests,
  completeQuest,
  fetchLatestQuest
} from '../controllers/questController.js';

const router = express.Router();

// Create a new quest
router.post('/create', createQuest);

// Hero offers to help on a quest
router.post('/:questId/offer', offerToHelp);

// Requester views pending hero offers for a quest
router.get('/:questId/pending-offers', getPendingOffersForQuest);

// Requester approves a hero for their quest
router.post('/:questId/approve', approveHeroOffer);

// Mark quest as completed
router.post('/:questId/complete', completeQuest);

// Get all open quests
router.get('/open', getOpenQuests);

// Fetch the latest quest by a requester (mainly for testing)
router.get('/latest/:requesterId', fetchLatestQuest);

export default router;