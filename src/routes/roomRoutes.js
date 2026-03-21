import express from 'express';
import * as roomController from '../controllers/roomController.js';

const router = express.Router();

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/manager/:managerId', roomController.getRoomByManagerId);
router.post('/', roomController.createRoom);
router.post('/join', roomController.VoterJoinGroup);
router.get('/pending/:roomId', roomController.getPendingMembers);
router.get('/approved/:roomId', roomController.getApprovedMembers);
router.put('/approve', roomController.approveMember);
router.get('/members/:memberId', roomController.getRoomByMemberId);
router.get('/checkApproved/:roomId/:userId', roomController.checkApprovedByMemberId);

export default router;