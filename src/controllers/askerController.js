const { z } = require('zod');
const askerService = require('../services/askerService');

//Esquema de validacion para el Solicitante (Asker)
const createAskerSchema = z.object({
  contactPerson: z.string().min(2, "El nombre de contacto es obligatorio"),
  organizationName: z.string().optional(),
  phone: z.string().regex(/^\+?\d{9,15}$/, "El teléfono debe contener entre 9 y 15 dígitos").optional(),
  email: z.string().email("Formato de email inválido").optional().or(z.literal('')),
  address: z.string().optional(),
  askAuthorId: z.string().uuid("El ID del autor debe ser un UUID válido")
}).refine((data) => data.phone || data.email || data.address, {
  message: "Debe proporcionar al menos un método de contacto válido (teléfono, email o dirección).",
  path: ["contactInfo"] // Etiqueta genérica para el error
});

const createAskerController = async (req, res, next) => {
    try {
        // 1. Validación estricta del body
        const validatedData = createAskerSchema.parse(req.body);
        const asker = await askerService.createAsker(validatedData);

        res.status(201).json({
            success: true,
            message: 'Solicitante (Asker) creado con éxito',
            data: asker
        });
    } catch (error) {
        // Delegamos al src/middlewares/errorHandler.js
        next(error);
    }
};

module.exports = {
    createAskerController,
};