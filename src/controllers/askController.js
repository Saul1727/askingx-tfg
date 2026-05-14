const { z } = require('zod');
const askService = require('../services/askService');

//Esquema de validacion para la Peticion (Ask)
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

//Esquema de validación para actualizar una Petición (Ask)
const updateAskStatusSchema = z.object({
    status: z.enum(['CREATED', 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
         {errorMap: () => ({ message: "El estado proporcionado no es válido para el sistema." })
    })
});

const createAskController = async (req, res, next) => {
    try {
        // INYECCIÓN DE SEGURIDAD ANTI-SUPLANTACIÓN
        // Forzamos que el autor de la petición sea SÍ O SÍ el ID extraído del Token JWT verificado.
        req.body.askAuthorId = req.user.userId;

        // 1. Validación estricta del body (ahora ya lleva el ID seguro)
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

const getAllAsksController = async (req, res, next) => {
    try {
        //Extraemos filtros de query params (si los hay)
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

// Controlador para modificar el estado de una Petición (PATCH)
const updateAskStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Validamos que en la URL venga un UUID correcto
        z.string().uuid("El ID de la petición debe ser un UUID válido").parse(id);

        // Validamos que el JSON del body sea correcto (ej: { "status": "OPEN" })
        const validatedData = updateAskStatusSchema.parse(req.body);

        const updatedAsk = await askService.updateAskStatus(id, validatedData.status, req.user);

        res.status(200).json({
            success: true,
            message: `Estado de la petición actualizado con éxito a ${validatedData.status}`,
            data: updatedAsk
        });
    } catch (error) {
        next(error);
    }
};

// Añade esto en tu askController.js
const matchAskController = async (req, res, next) => {
    try {
        const askId = req.params.id; // Lo sacamos de la URL
        const { giverId } = req.body; // El Connector nos dice qué donante ha elegido
        const connectorId = req.user.userId; // Extraído automáticamente del Token de seguridad

        if (!giverId) {
            return res.status(400).json({ 
                success: false, 
                message: "El campo giverId es obligatorio en el body" 
            });
        }

        // Llamamos al servicio
        const matchedAsk = await askService.matchAsk(askId, connectorId, giverId);

        res.status(200).json({
            success: true,
            message: "¡Match realizado con éxito!",
            data: matchedAsk
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAskController,
    getAllAsksController,
    updateAskStatusController,
    matchAskController
};