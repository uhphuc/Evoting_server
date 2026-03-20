import express from 'express';
import * as userController from '../controllers/userController.js';
import adminMiddleware from '../middleware/admin_mw.js';
import authMiddleware from '../middleware/auth_mw.js';
const router = express.Router();


router.get('/', adminMiddleware, userController.getAllUsers);
router.post('/voter', adminMiddleware,userController.createVoter);
router.post('/manager', adminMiddleware, userController.createManager);
router.get('/voters', adminMiddleware, userController.getVoters);
router.get('/managers', adminMiddleware, userController.getManagers);
router.get('/:userId', authMiddleware, userController.getUserById); 
router.put('/:userId', authMiddleware, userController.updateUser); 
router.delete('/:userId', adminMiddleware, userController.deleteUser);


// export the router
export default router;
