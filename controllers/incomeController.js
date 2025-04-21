import Income from '../models/Income.js';
import User from '../models/User.js';
import moment from 'moment';

export const createIncome = async (req, res, next) => {
    try {

        const phone = req.params.phone;

        const { income_title, amount, date, category, subcategory, payment_method, institution, description, source, received_in } = req.body;

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

        const income = new Income({ phone, income_title, amount, date, category, subcategory, payment_method, institution, description, source, received_in, user_id: existingUser._id });
        await income.save();

        res.status(201).json({
            success: true,
            expenseSaved: true,
            message: "Entrada registrada com sucesso!"
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

export const getIncomes = async (req, res, next) => {
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

        const incomes = await Income.find(query).sort({ date: -1 });

        const cleanedIncomes = incomes.map(exp => {
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
            count: cleanedIncomes?.length || 0,
            expenses: cleanedIncomes
        });

    } catch (error) {
        console.error(error);
        next();
    }
};

export const deleteIncome = async (req, res, next) => {
    try {
        const { incomeId } = req.params;
        const userId = req?.user?._id?.toString();

        console.log('income: ', incomeId, userId);

        const deleted = await Income.findOneAndDelete({ _id: incomeId, user_id: userId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                deleted: false,
                message: "Entrada não encontrada ou não pertence ao usuário."
            });
        }

        res.status(200).json({
            success: true,
            deleted: true,
            message: "Entrada removida com sucesso."
        });
    } catch (error) {
        console.error(error);
        next();
    }
};

export const updateIncome = async (req, res, next) => {
    try {
        const { incomeId } = req.params;
        const updates = req.body;
        const userId = req.user._id;  // Pega do token

        const updated = await Income.findOneAndUpdate(
            { _id: incomeId, user_id: userId },  // Garantir que é o usuário
            updates,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                updated: false,
                income: {},
                message: "Entrada não encontrada ou não pertence ao usuário."
            });
        }

        // Format amount for response
        const formattedIncome = updated.toObject();
        formattedIncome.amount = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(formattedIncome.amount?.toString()));

        res.status(200).json({
            success: true,
            updated: true,
            income: formattedIncome,
            message: "Entrada atualizada com sucesso.",
        });
    } catch (error) {
        console.error(error);
        next();
    }
};