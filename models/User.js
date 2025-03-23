import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Validação básica de e-mail
            },
            message: props => `${props.value} não é um e-mail válido!`
        }
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^55\d{2}(?:[2-8]|9[1-9])\d{3}\d{4}$/.test(v); // Regex for Brazilian phone numbers
            },
            message: props => `${props.value} não é um número de telefone brasileiro válido!`
        }
    },
    opt_in: { type: Boolean, required: false }
    // password: { type: String, required: true }
}, {
    timestamps: true // Adiciona "createdAt" e "updatedAt" automaticamente
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

export default mongoose.model('User', userSchema, 'users');