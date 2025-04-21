import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import { validateToken } from './middleware/validateToken.js';
dotenv.config();

const app = express();

app.use(express.json());

connectDB();

// USUÁRIOS
app.use('/api/user', userRoutes);

// REGISTRAR/BUSCAR DESPESAS
app.use('/api/expense', validateToken, expenseRoutes);
// update nas despesas
// identificar tags/categorias das despesas de acordo com input

// REGISTRAR/BUSCAR RECEITAS
app.use('/api/income', validateToken, incomeRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening...'))

// Adicionar refresh token nas reqs /expense