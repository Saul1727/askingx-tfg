const { z } = require('zod');
const askService = require('../services/askService');

//Esquema de validacion para la Peticion (Ask)
const createAskSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(15, "La descripción debe ser más detallada (mínimo 15 caracteres)"),
  // Enum estricto basado en Prisma y el modelo AskingX
  type: z.enum(['THINGS', 'TIME', 'EXPERTISE', 'SERVICES'], {
    errorMap: () => ({ message: "El tipo debe ser THINGS, TIME, EXPERTISE o SERVICES" })
  }),
  dueDate: z.string().datetime({ message: "La fecha límite debe estar en formato ISO 8601 (ej. 2026-12-31T23:59:59Z)" }).optional(),
  
  // Relaciones
  askerId: z.string().uuid("El ID del solicitante debe ser un UUID válido"),
  askAuthorId: z.string().uuid("El ID del autor debe ser un UUID válido"),
  
  // Campos especializados (Todos opcionales porque dependen del 'type')
  quantityRequested: z.number().int().positive("La cantidad debe ser un número entero positivo").optional(),
  estimatedHours: z.number().int().positive("Las horas estimadas deben ser positivas").optional(),
  requiredSkill: z.string().optional(),
  serviceLocation: z.string().optional()
});

const createAskController = async (req, res, next) => {
    try {
        // 1. Validación estricta del body
        const validatedData = createAskSchema.parse(req.body);
        const ask = await askService.createAsk(validatedData);

        res.status(201).json({
            success: true,
            message: 'Petición (Ask) creada con éxito',
            data: ask
        });
    } catch (error) {
        // Delegamos al src/middlewares/errorHandler.js
        next(error);
    }
};

module.exports = {
    createAskController,
};