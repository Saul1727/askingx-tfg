const jwt = require('jsonwebtoken');
const { tr } = require('zod/locales');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = new Error('Acceso denegado. Token no proporcionado.');
            error.statusCode = 401;
            throw error;
        }

        // Extraemos el token con formato "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            const error = new Error(`Formato de token inválido. Use: Bearer <token>`);
            error.statusCode = 401;
            throw error;
        }

        // Verificamos el token con el .env
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        // Agregamos la información del usuario al objeto de solicitud
        req.user = {
            userId: decodedPayload.userId,
            role: decodedPayload.role
        };
        next();
    } catch (error) {
        const error = new Error(err.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.');
        error.statusCode = 401;
        next(error);
    }
};

module.exports = authMiddleware;