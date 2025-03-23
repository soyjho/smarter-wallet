import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    if (token == null) res.sendStatus(400).send('Token not present');
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                "success": false,
                "expenseSaved": false,
                "message": "Token inválido!"
            });
        }
        else {
            req.user = user;
            next();
        }
    })
};