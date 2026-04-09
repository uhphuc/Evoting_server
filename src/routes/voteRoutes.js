import express from 'express';
import * as voteController from '../controllers/voteController.js';
import authMiddleware from '../middleware/auth_mw.js';

const router = express.Router();

router.post('/', authMiddleware,  voteController.postVotes);
router.get('/results/:roomId', voteController.getTotalVotes);
router.get('/has-voted/:roomId', authMiddleware, voteController.hasVoted);

export default router;