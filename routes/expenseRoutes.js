import express from "express";
import { createExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/:phone', createExpense);

export default router;