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
  getPostedQuestsByUser,
  withdrawFromQuest,
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
router.get('/posted/:userId', getPostedQuestsByUser);
router.post('/withdraw', withdrawFromQuest);

export default router;
