import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'phone (Número de telefone) é uma informação obrigatória.']
    },
    expense_title: {
        type: String,
        required: true
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'amount (despesa) é uma informação obrigatória.']
    },
    date: {
        type: String,
        required: [true, 'date (data em que ocorreu a despesa) é uma informação obrigatória.'],
        validate: {
            validator: function (value) {
                // Regex to match YYYY-MM-DD format
                return /^\d{4}-\d{2}-\d{2}$/.test(value);
            },
            message: props => `${props.value} não está no formato válido (YYYY-MM-DD).`
        }
    },
    category: {
        type: String,
        required: [true, 'category (tipo de gasto) é uma informação obrigatória.']
    },
    subcategory: {
        type: String
    },
    payment_method: {
        type: String
    },
    account: { // Nubank, Itaú etc.
        type: String
    },
    description: { // Detalhes adicionais
        type: String
    },
    location: {
        type: Object
    },
    priority_tag: { // essencial, opcional, luxo
        type: String
    },
    user_id: {
        type: String
    }
}, {
    timestamps: true // Adiciona "createdAt" e "updatedAt" automaticamente
});

export default mongoose.model('Expense', expenseSchema, 'expenses');