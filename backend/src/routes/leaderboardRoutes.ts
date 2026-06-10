import { Router } from 'express';
import { getLeaderboard, postScore } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/', getLeaderboard);
router.post('/', postScore);

export default router;
