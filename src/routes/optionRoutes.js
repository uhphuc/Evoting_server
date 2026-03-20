import express from 'express';
import * as optionController from '../controllers/optionController.js';

const router = express.Router();

router.get('/room/:roomId', optionController.getOptionsByRoomId);
router.post('/', optionController.createOption);

export default router;