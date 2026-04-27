const { ZodError } = require('zod'); // Importamos la clase oficial de Zod

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`); 
  
  // Comprobación profesional: ¿Es una instancia de ZodError?
  if (err instanceof ZodError) {
    // Usamos err.issues, que es donde Zod guarda realmente los problemas
    const errorMessages = err.issues.map(issue => issue.message);

    return res.status(400).json({
        success: false,
        message: errorMessages[0], // Mostramos el mensaje limpio al usuario
        details: err.issues // Devolvemos los detalles técnicos reales
    });
  }

  // Si no es un error de validación, es un error normal de nuestro servidor
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
      success: false,
      message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;