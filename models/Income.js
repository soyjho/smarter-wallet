import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'O número de telefone do usuário é obrigatório.']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    income_title: {
        type: String,
        required: [true, 'O título da receita é obrigatório.']
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'O valor da receita é obrigatório.']
    },
    date: {
        type: String,
        required: [true, 'A data da receita é obrigatória.'],
        validate: {
            validator: function (value) {
                return /^\d{4}-\d{2}-\d{2}$/.test(value);
            },
            message: props => `${props.value} não está no formato válido (YYYY-MM-DD).`
        }
    },
    category: {
        type: String,
        // enum: [
        //     'Salário',
        //     'Freelance',
        //     'Renda extra',
        //     'PIX recebido',
        //     'Reembolso',
        //     'Investimento',
        //     'Aluguel recebido',
        //     'Aposentadoria/INSS',
        //     'Outros'
        // ],
        required: [true, 'A categoria da receita é obrigatória.']
    },
    subcategory: {
        type: String
    },
    payment_method: {
        type: String,
        enum: ['PIX', 'Transferência', 'TED', 'DOC', 'Dinheiro', 'Cheque', 'Outro'],
        required: [true, 'O método de recebimento é obrigatório.']
    },
    institution: { // Pra onde foi o dinheiro
        type: String,
        required: false,
        // enum: [
        //     'Nubank',
        //     'Itaú',
        //     'Bradesco',
        //     'Banco do Brasil',
        //     'Caixa',
        //     'Santander',
        //     'Inter',
        //     'C6 Bank',
        //     'PicPay',
        //     'Digio',
        //     'Outros'
        // ]
    },
    received_in: {
        type: String,
        enum: ['Conta bancária', 'Dinheiro em mãos', 'Carteira digital', 'Outro'],
        default: 'Conta bancária'
    },
    source: { // De onde veio o dinheiro
        type: String,
        default: ''
    },
    description: {
        type: String
    },
}, {
    timestamps: true
});

export default mongoose.model('Income', incomeSchema);