import express from 'express';
import { createIncome, getIncomes, deleteIncome, updateIncome } from '../controllers/incomeController.js';

const router = express.Router();

router.post('/:phone', createIncome);
router.get('/:phone', getIncomes);
router.delete('/:incomeId', deleteIncome);
router.put('/:incomeId', updateIncome);

export default router;