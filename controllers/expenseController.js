import Expense from '../models/Expense.js';
import User from '../models/User.js';
import moment from 'moment';
import mongoose from 'mongoose';

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

        const expense = new Expense({ phone, expense_title, amount, date, category, subcategory, payment_method, account, description, location, priority_tag, user_id: existingUser._id });
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
                tokenExpired: error.message === 'Token inválido!',
                message: error.message
            })
        }
        next();
    }
}

export const getExpenses = async (req, res, next) => {
    try {
        const phone = req.params.phone;
        const { category, subcategory, startDate, endDate } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "A categoria é obrigatória para a busca."
            });
        }

        const existingUser = await User.findOne({ phone });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }

        const query = {
            phone,
            category,
            user_id: existingUser._id
        };

        if (subcategory) {
            query.subcategory = subcategory;
        }

        // // Handle date range
        let start = startDate ? startDate : moment().subtract(30, 'days').format('YYYY-MM-DD');
        let end = endDate ? endDate : moment().format('YYYY-MM-DD');

        query.date = { $gte: start, $lte: end };

        const expenses = await Expense.find(query).sort({ date: -1 });

        const cleanedExpenses = expenses.map(exp => {
            const obj = exp.toObject();

            const numericAmount = parseFloat(obj.amount?.toString());
            obj.amount = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(numericAmount);

            const formattedDate = moment(obj.date, 'YYYY-MM-DD').format('DD/MM/YYYY')
            if (formattedDate !== 'Invalid date') {
                obj.date = formattedDate;
            };

            return obj;
        });

        res.status(200).json({
            success: true,
            count: cleanedExpenses?.length || 0,
            expenses: cleanedExpenses
        });

    } catch (error) {
        console.error(error);
        next();
    }
};

export const deleteExpense = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const userId = req?.user?._id?.toString();

        const deleted = await Expense.findOneAndDelete({ _id: expenseId, user_id: userId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                deleted: false,
                message: "Despesa não encontrada ou não pertence ao usuário."
            });
        }

        res.status(200).json({
            success: true,
            deleted: true,
            message: "Despesa removida com sucesso."
        });
    } catch (error) {
        console.error(error);
        next();
    }
};

export const updateExpense = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const updates = req.body;
        const userId = req.user._id;  // Pega do token

        console.log(updates);

        const updated = await Expense.findOneAndUpdate(
            { _id: expenseId, user_id: userId },  // Garantir que é o usuário
            updates,
            { new: true, runValidators: true }
        );

        console.log(updated);

        if (!updated) {
            return res.status(404).json({
                success: false,
                updated: false,
                expense: {},
                message: "Despesa não encontrada ou não pertence ao usuário."
            });
        }

        // Format amount for response
        const formattedExpense = updated.toObject();
        formattedExpense.amount = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(formattedExpense.amount?.toString()));

        res.status(200).json({
            success: true,
            updated: true,
            expense: formattedExpense,
            message: "Entrada atualizada com sucesso.",
        });
    } catch (error) {
        console.error(error);
        next();
    }
};



