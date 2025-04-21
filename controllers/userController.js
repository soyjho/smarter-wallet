import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateAccessToken = (userName) => {
    return jwt.sign(userName, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1800s'
    });
};

export const getUser = async (req, res, next) => {
    try {
        // Fazer busca do usuário com base no e-mail
        const user = await User.findOne({ email: req.body.email });

        if (!user) return res.status(404).json({
            success: true,
            found: false,
            message: "Usuário não encontrado"
        });

        // 1. Extrair password e salt (string aleatória agregada ao password) a partir dos dados passados na requisição
        const { password: storedHash, salt: storedSalt } = user;

        // 2. Encripta o password informado na requisição usando o storedSalt pra comparar o password informado com o que foi registrado
        const inputHash = await new Promise((resolve, reject) => {
            crypto.pbkdf2(req.body.password, storedSalt, 1000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        // 3. Comparação
        if (inputHash === storedHash) {
            // Se password for correto, gera token de acesso
            const accessToken = generateAccessToken({ user: req.body.email, id: user._id });

            return res.status(200).json({
                accessToken: accessToken,
                userId: user._id,
                message: 'Login successful!'
            });
        } else {
            return res.status(400).json({
                accessToken: '',
                userId: '',
                message: 'Credenciais inválidas!'
            });
        }
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        // const { name, email, password } = req.body;
        const { name, email, phone, opt_in, password } = req.body;

        // Verificar existência de e-mail ou telefone na base
        ////////////////   START A   ////////////////////////////
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        let isEmailRegistered = false;
        let isPhoneRegistered = false;
        if (existingUser) {
            if (existingUser.email === email) isEmailRegistered = true;
            if (existingUser.phone === phone) isPhoneRegistered = true;
            return res.status(409).json({
                success: true,
                registered: false,
                isEmailRegistered,
                isPhoneRegistered,
                message: "Dados já cadastrados!"
            });
        }
        ////////////////   END A   ////////////////////////////

        // Gerar string aleatória para agregar ao password, deixando ele mais "forte"
        const salt = crypto.randomBytes(16).toString('hex');

        const hashedPassword = await new Promise((resolve, reject) => {
            crypto.pbkdf2(req.body.password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        const user = new User({ name, email, phone, opt_in, password: hashedPassword, salt });
        await user.save();

        res.status(201).json({
            success: true,
            registered: true,
            userID: user._id,
            message: "Usuário registrado com sucesso!"
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                registered: false,
                userID: null,
                message: error.message
            });
        }
        next();
    }
};

export const deleteUserAndData = async (req, res, next) => {
    try {
        const userId = req.user._id; // _id é atrelado ao token no login

        // 1. Deletar despesas
        await Expense.deleteMany({ user_id: userId });

        // 2. Deletar entradas
        await Income.deleteMany({ user_id: userId });

        // 3. Deletar usuário
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Todos os dados do usuário foram deletados com sucesso.'
        });
    } catch (error) {
        console.error(error);
        next();
    }
};