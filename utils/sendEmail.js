import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
    try {
        await resend.emails.send({
            from: 'Smarter Wallet <onboarding@resend.dev>',
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
    }
};

export default sendEmail;

