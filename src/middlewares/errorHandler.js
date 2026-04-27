const { success } = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`); 
  
  
if (err.name === `ZodError`) {
    return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: err.errors
    });
}

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;