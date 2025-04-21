import express from "express";
import { createExpense, getExpenses, deleteExpense, updateExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/:phone', createExpense);
router.get('/:phone', getExpenses);
router.delete('/:expenseId', deleteExpense);
router.put('/:expenseId', updateExpense);

export default router;