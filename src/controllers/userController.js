const { z } = require('zod');
const userService = require('../services/userService');

// Definimos el esquema estricto de entrada
const createAdminSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
});

const createAdminController = async (req, res, next) => {
  try {
    // 1. Validación estricta del body
    const validatedData = createAdminSchema.parse(req.body);

    // 2. Llamada al servicio
    const user = await userService.createAdmin(validatedData);

    // 3. Respuesta limpia (sin devolver el passwordHash)
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      message: 'Administrador creado con éxito',
      data: userWithoutPassword
    });
  } catch (error) {
    // Delegamos al middleware global que ya tienes en src/middlewares/errorHandler.js
    next(error); 
  }
};

module.exports = {
  createAdminController,
};