import express from 'express';
import * as roomController from '../controllers/announController.js';

const router = express.Router();

router.get('/:userId', roomController.getAnnouncementsForUser);

export default router;
