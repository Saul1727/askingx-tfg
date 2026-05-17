const e = require("cors");

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Verificamos que el authMiddleware haya agregado la información del usuario a la solicitud
        if (!req.user || !req.user.role) {
            const error = new Error('No se ha podido verificare la identidad del usuario.');
            error.statusCode = 401;
            return next(error);
        }

        // Verificamos si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(req.user.role)) {
            const error = new Error(`Acceso denegado. Requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`);
            error.statusCode = 403;
            return next(error);
        }

        // Si es verificado, pasa al controlador
        next();
    };
};

module.exports = roleMiddleware;