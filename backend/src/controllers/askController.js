const { z } = require('zod');
const askService = require('../services/askService');

// Esquema de validación para la Creación de la Petición (Ask)
const createAskSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(15, "La descripción debe ser más detallada (mínimo 15 caracteres)"),
  type: z.enum(['THINGS', 'TIME', 'EXPERTISE', 'SERVICES'], {errorMap: () => ({ message: "El tipo debe ser THINGS, TIME, EXPERTISE o SERVICES" })}),
  dueDate: z.string().datetime({ message: "La fecha límite debe estar en formato ISO 8601 (ej. 2026-12-31T23:59:59Z)" }).optional(),
  askerId: z.string().uuid("El ID del solicitante debe ser un UUID válido"),
  askAuthorId: z.string().uuid("El ID del autor debe ser un UUID válido"),
  domainId: z.string().uuid("ID de dominio no válido"),

  // Campos especializados (Todos opcionales porque dependen del 'type')
  quantityRequested: z.number().int().positive("La cantidad debe ser un número entero positivo").optional(),
  estimatedHours: z.number().int().positive("Las horas estimadas deben ser positivas").optional(),
  requiredSkill: z.string().optional(),
  serviceLocation: z.string().optional()
});

// Esquema de validación para la Edición Completa de la Petición
const updateAskSchema = createAskSchema.partial().extend({
  status: z.enum(['CREATED', 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED']).optional()
});

// Esquema de validación para actualizar ÚNICAMENTE el estado de una Petición
const updateAskStatusSchema = z.object({
    status: z.enum(
        ['CREATED', 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
        { errorMap: () => ({ message: "El estado proporcionado no es válido para el sistema." }) }
    ),
    // Motivo opcional, solo se persiste cuando el estado destino es CANCELLED
    cancellationReason: z.string().optional()
});

const createAskController = async (req, res, next) => {
    try {
        req.body.askAuthorId = req.user.userId;
        const validatedData = createAskSchema.parse(req.body);
        const ask = await askService.createAsk(validatedData);

        res.status(201).json({
            success: true,
            message: 'Petición (Ask) creada con éxito',
            data: ask
        });
    } catch (error) {
        next(error);
    }
};

const getAllAsksController = async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
        };

        const asks = await askService.getAllAsks(req.user, filters);

        res.status(200).json({
            success: true,
            message: 'Peticiones recuperadas con éxito',
            data: asks
        });
    } catch (error) {
        next(error);
    }
};

// Edición Completa de la Petición (PUT)
const updateAskController = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        z.string().uuid("El ID de la petición debe ser un UUID válido").parse(id);
        const validatedData = updateAskSchema.parse(req.body);

        const updatedAsk = await askService.updateAsk(id, validatedData, req.user);

        res.status(200).json({
            success: true,
            message: 'Petición (Ask) actualizada con éxito',
            data: updatedAsk
        });
    } catch (error) {
        next(error);
    }
};

// Controlador para modificar el estado de una Petición de forma aislada (PATCH)
const updateAskStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;

        z.string().uuid("El ID de la petición debe ser un UUID válido").parse(id);
        const validatedData = updateAskStatusSchema.parse(req.body);

        const updatedAsk = await askService.updateAskStatus(id, validatedData.status, req.user, validatedData.cancellationReason);

        res.status(200).json({
            success: true,
            message: `Estado de la petición actualizado con éxito a ${validatedData.status}`,
            data: updatedAsk
        });
    } catch (error) {
        next(error);
    }
};

const matchAskController = async (req, res, next) => {
    try {
        const askId = req.params.id;
        const { giverIds } = req.body;
        const connectorId = req.user.userId;

        if (!giverIds || !Array.isArray(giverIds)) {
            return res.status(400).json({ 
                success: false, 
                message: "El campo giverIds es obligatorio en el body y debe ser un array" 
            });
        }

        const matchedAsk = await askService.matchAsk(askId, connectorId, giverIds);

        res.status(200).json({
            success: true,
            message: "¡Match actualizado con éxito!",
            data: matchedAsk
        });
    } catch (error) {
        next(error);
    }
};

// --- NUEVAS RUTAS CU-10: GESTIÓN DE EXPIRACIÓN ---

const discardAskSchema = z.object({
    cancellationReason: z.string().min(5, "El motivo debe tener al menos 5 caracteres").optional()
});

const republishAskSchema = z.object({
    newDueDate: z.string()
        .datetime({ message: "La fecha debe estar en formato ISO 8601 (ej. 2026-12-31T23:59:59Z)" })
        .refine((date) => new Date(date) > new Date(), { message: "La nueva fecha límite debe ser futura" })
});

const discardAskController = async (req, res, next) => {
    try {
        const { id } = req.params;
        z.string().uuid("El ID de la petición debe ser un UUID válido").parse(id);
        const { cancellationReason } = discardAskSchema.parse(req.body);

        const updatedAsk = await askService.discardAsk(id, req.user, cancellationReason);

        res.status(200).json({
            success: true,
            message: 'Petición descartada con éxito',
            data: updatedAsk
        });
    } catch (error) {
        next(error);
    }
};

const republishAskController = async (req, res, next) => {
    try {
        const { id } = req.params;
        z.string().uuid("El ID de la petición debe ser un UUID válido").parse(id);
        const { newDueDate } = republishAskSchema.parse(req.body);

        const newAsk = await askService.republishAsk(id, newDueDate, req.user);

        res.status(201).json({
            success: true,
            message: 'Petición republicada con éxito',
            data: newAsk
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAskController,
    getAllAsksController,
    updateAskController, 
    updateAskStatusController,
    matchAskController,
    discardAskController,
    republishAskController
};