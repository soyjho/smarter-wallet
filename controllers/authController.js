import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                userFound: false,
                message: "Usuário não encontrado."
            });
        }

        // Generate reset token (random string)
        const resetToken = crypto.randomBytes(6).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration in user record
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        await sendEmail(
            email,
            "Redefinição de senha",
            `Informe o código para que possa seguir com a redefinição de senha: ${resetToken}\n\nEste código é válido por 1 hora.`
        );

        console.log(email)

        return res.status(200).json({
            success: true,
            userFound: true,
            message: "E-mail enviado! Verifique sua caixa de entrada."
        });

    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;

        // Hash token to compare with stored value
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by email first
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                userFound: false,
                isTokenValid: false,
                isTokenExpired: false,
                message: "Usuário não encontrado!"
            });
        }

        // Check if the token matches
        if (user.resetPasswordToken !== hashedToken) {
            return res.status(400).json({
                success: false,
                userFound: true,
                isTokenValid: false,
                isTokenExpired: false,
                message: "Token inválido!"
            });
        }

        // Check if token is expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                userFound: true,
                isTokenValid: false,
                isTokenExpired: false,
                message: "Token expirado!"
            });
        }

        // Generate new salt and hash password
        const newSalt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await new Promise((resolve, reject) => {
            crypto.pbkdf2(newPassword, newSalt, 1000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.salt = newSalt;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            userFound: true,
            isTokenValid: true,
            isTokenExpired: false,
            message: "Senha redefinida com sucesso!"
        });

    } catch (error) {
        next(error);
    }
};
