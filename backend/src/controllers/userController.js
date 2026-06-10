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
  availabilityNotes: z.string().optional(),
  // Añadimos el array de dominios
  domainIds: z.array(z.string().uuid("Debe ser un ID válido")).optional()
}).superRefine((data, ctx) => {
  // Aplicamos la regla estricta de tu diagrama UML
  if (data.role === 'CONNECTOR' || data.role === 'GIVER') {
    if (!data.domainIds || data.domainIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los roles CONNECTOR y GIVER deben estar asociados al menos a un Dominio.",
        path: ["domainIds"]
      });
    }
  }
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

const getGiversController = async (req, res, next) => {
    try {
        const givers = await userService.getGivers();
        res.status(200).json({
            success: true,
            data: givers
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsersController = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            message: 'Usuarios recuperados con éxito',
            data: users
        });
    } catch (error) {
        next(error);
    }
};

const updateUserController = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Permite cambiar el estado (isActive) y/o los dominios (domainIds) del usuario.
        const updateSchema = z.object({
            isActive: z.boolean().optional(),
            domainIds: z.array(z.string().uuid("Debe ser un ID válido")).optional()
        }).refine(
            (d) => d.isActive !== undefined || d.domainIds !== undefined,
            { message: "No se ha proporcionado ningún campo para actualizar." }
        );
        const validatedData = updateSchema.parse(req.body);

        const updatedUser = await userService.updateUser(id, validatedData);
        
        const { passwordHash, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado con éxito',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};


const updateUserProfileController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profileSchema = z.object({
            fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
            avatarUrl: z.string().url("URL inválida").optional().or(z.literal('')),
            preferredLanguage: z.enum(['ES', 'CAT', 'EN']).optional()
        });
        const validatedData = profileSchema.parse(req.body);

        const updatedUser = await userService.updateUserProfile(userId, validatedData);
        
        res.status(200).json({
            success: true,
            message: 'Perfil actualizado con éxito',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

const changePasswordController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const passwordSchema = z.object({
            oldPassword: z.string().min(1, "La contraseña actual es obligatoria"),
            newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        });
        const { oldPassword, newPassword } = passwordSchema.parse(req.body);

        await userService.changePassword(userId, oldPassword, newPassword);
        
        res.status(200).json({
            success: true,
            message: 'Contraseña cambiada con éxito'
        });
    } catch (error) {
        next(error);
    }
};

const resetPasswordController = async (req, res, next) => {
    try {
        const userId = req.params.id; // Admin is resetting for this user
        const resetSchema = z.object({
            newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        });
        const { newPassword } = resetSchema.parse(req.body);

        await userService.resetUserPassword(userId, newPassword);
        
        res.status(200).json({
            success: true,
            message: 'Contraseña restablecida con éxito'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  createAdminController,
  createAskAuthorController,
  registerUserController,
  loginUserController,
  getGiversController,
  getAllUsersController,
  updateUserController,
  updateUserProfileController,
  changePasswordController,
  resetPasswordController
};