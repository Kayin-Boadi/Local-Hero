import express from 'express';
import {
  createQuest,
  offerToHelp,
  approveHeroOffer,
  getOpenQuests,
  getPendingOffersForQuest,
  completeQuest,
  fetchLatestQuest
} from '../controllers/questController.js';

const router = express.Router();

router.post('/create', createQuest);
router.post('/offer', offerToHelp);
router.post('/approve', approveHeroOffer);
router.get('/open', getOpenQuests);
router.get('/pending/:questId', getPendingOffersForQuest);
router.post('/complete', completeQuest);
router.get('/latest/:requesterId', fetchLatestQuest);

export default router;
