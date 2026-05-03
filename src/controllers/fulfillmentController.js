const { z } = require('zod');
const fulfillmentService = require('../services/fulfillmentService');

// Esquema de validación para la Entrega
const createFulfillmentSchema = z.object({
  askId: z.string().uuid("El ID de la petición debe ser un UUID válido"),
  giverId: z.string().uuid("El ID del donante debe ser un UUID válido"),
  
  // Campos de la donación
  quantityDelivered: z.number().int().positive("La cantidad entregada debe ser un número positivo").optional(),
  expertNotes: z.string().min(5, "Las notas deben tener al menos 5 caracteres").optional()
}).refine(data => data.quantityDelivered || data.expertNotes, {
  message: "Debe proporcionar una cantidad entregada o al menos unas notas sobre la entrega.",
  path: ["fulfillmentDetails"]
});

const createFulfillmentController = async (req, res, next) => {
  try {
    const validatedData = createFulfillmentSchema.parse(req.body);
    const fulfillment = await fulfillmentService.createFulfillment(validatedData);

    res.status(201).json({
      success: true,
      message: 'Entrega (Fulfillment) registrada con éxito',
      data: fulfillment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFulfillmentController,
};