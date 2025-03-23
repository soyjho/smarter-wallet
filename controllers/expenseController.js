import Expense from '../models/Expense.js';
import User from '../models/User.js';

export const createExpense = async (req, res, next) => {
    try {

        const phone = req.params.phone;

        const { expense_title, amount, date, category, subcategory, payment_method, account, description, location, priority_tag } = req.body;

        // Verificar existência de usuário na base
        ////////////////   START A   ////////////////////////////
        const existingUser = await User.findOne({ phone });

        if (!existingUser) {
            return res.status(409).json({
                success: true,
                expenseSaved: false,
                message: "Usuário ainda não possui cadastro!"
            });
        }
        ////////////////   END A   ////////////////////////////

        const expense = new Expense({ phone, expense_title, amount, date, category, subcategory, payment_method, account, description, location, priority_tag });
        await expense.save();

        res.status(201).json({
            success: true,
            expenseSaved: true,
            message: "Despesa registrada com sucesso!"
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                expenseSaved: false,
                message: error.message
            })
        }
        next();
    }
}



