const { z } = require('zod');
const userService = require('../services/userService');

// Definimos el esquema estricto de entrada
const createUserSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
});

const createAdminController = async (req, res, next) => {
  try {
    // 1. Validación estricta del body
    const validatedData = createUserSchema.parse(req.body);

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

const createAskAuthorController = async (req, res, next) => {
    try {
        // 1. Usamos el mismo esquema de validación para crear un AskAuthor
        const validatedData = createUserSchema.parse(req.body);

        // 2. Llamada al servicio para crear un AskAuthor
        const user = await userService.createAskAuthor(validatedData);

        // 3. Respuesta limpia (sin devolver el passwordHash)
        const { passwordHash, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            message: 'AskAuthor (Trabajador Social) creado con éxito',
            data: userWithoutPassword
        });
    } catch (error) {
        // Delegamos al src/middlewares/errorHandler.js
        next(error);
    }
};

const registerUserSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"), 
  role: z.enum(['ADMIN', 'AUTHOR', 'CONNECTOR', 'GIVER'], {
    errorMap: () => ({ message: "Rol inválido. Debe ser ADMIN, AUTHOR, CONNECTOR o GIVER" })
  }),
  preferredLanguage: z.enum(['ES', 'CAT', 'EN']).optional(),
  availabilityNotes: z.string().optional()
});

// Controlador para registro generico de usuarios
const registerUserController = async (req, res, next) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);

    // Ocultamos la contraseña en la respuesta
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: `Usuario con rol ${user.role} registrado con éxito`,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

const loginUserSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

const loginUserController = async (req, res, next) => {
  try {
    // Validamos los datos de entrada (email y password)
    const validatedData = loginUserSchema.parse(req.body);

    // Llamamos al servicio de login
    const { user, token } = await userService.loginUser(validatedData);

    // Sacamos passwordHash para no devolverlo en la respuesta
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        token: token // Devolvemos el token JWT al cliente
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdminController,
  createAskAuthorController,
  registerUserController,
  loginUserController
};