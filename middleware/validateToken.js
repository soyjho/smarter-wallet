import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const validateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Busca o usuário no banco (opcional, mas bom pra validar existência)
        const user = await User.findById(decoded.id); // ou decoded._id

        console.log(decoded);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário inválido.' });
        }

        req.user = {
            _id: user._id,
            phone: user.phone,
            name: user.name,
            // qualquer outro dado que quiser
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }
};



// import jwt from 'jsonwebtoken';

// export const validateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader.split(' ')[1];

//     if (token == null) res.sendStatus(400).send('Token not present');
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({
//                 "success": false,
//                 "expenseSaved": false,
//                 "message": "Token inválido!"
//             });
//         }
//         else {
//             req.user = user;
//             next();
//         }
//     })
// };