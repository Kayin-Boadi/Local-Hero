import express from 'express';
import {
  createQuest,
  offerToHelp,
  approveHeroOffer,
  getOpenQuests,
  getPendingOffersForQuest,
  completeQuest,
  fetchLatestQuest,
  getNearbyQuests,
  getPendingQuestForHero
} from '../controllers/questController.js';

const router = express.Router();

router.post('/create', createQuest);
router.post('/offer', offerToHelp);
router.post('/approve', approveHeroOffer);
router.get('/open', getOpenQuests);
router.get('/pending/:questId', getPendingOffersForQuest);
router.get('/pending/hero/:heroId', getPendingQuestForHero);
router.post('/complete', completeQuest);
router.get('/latest/:requesterId', fetchLatestQuest);
router.post('/nearby',getNearbyQuests);

export default router;
