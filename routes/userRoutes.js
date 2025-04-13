import express from "express";
import { getUser, createUser } from '../controllers/userController.js';
import { requestPasswordReset, resetPassword } from '../controllers/authController.js'

const router = express.Router();

router.post('/login', getUser);
router.post('/signup', createUser);

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;