import express from 'express';
import * as voteController from '../controllers/voteController.js';

const router = express.Router();

router.post('/', voteController.postVote);
router.get('/results/:roomId', voteController.getTotalVotes);

export default router;