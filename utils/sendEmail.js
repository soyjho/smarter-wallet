import nodemailer from 'nodemailer';

console.log("Using email:", process.env.EMAIL_USER); // Debugging
console.log("Using pass:", process.env.EMAIL_PASS); // Debugging

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email provider
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your email password
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });
};

export default sendEmail;