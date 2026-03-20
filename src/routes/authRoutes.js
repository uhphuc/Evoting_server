import express from 'express';
import * as auth from '../controllers/authController.js';
import authMiddleware from '../middleware/auth_mw.js';

const router = express.Router();

router.post("/register", auth.authController.register);
router.post("/login", auth.authController.login);
router.post("/logout", auth.authController.logout);
// getme 
router.get("/getme", authMiddleware, auth.authController.getMe);

export default router;
