import express from "express";
import { getUser, createUser } from '../controllers/userController.js';
import { requestPasswordReset, resetPassword } from '../controllers/authController.js'
import { deleteUserAndData } from '../controllers/userController.js';
import { validateToken } from '../middleware/validateToken.js';

const router = express.Router();

router.post('/login', getUser);
router.post('/signup', createUser);

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.delete('/delete-account', validateToken, deleteUserAndData);

export default router;