const prisma = require('../config/prisma');

const createFulfillment = async (data) => {
  // Verificamos que la Petición existe
  const ask = await prisma.ask.findUnique({
    where: { id: data.askId }
  });

  if (!ask) {
    const error = new Error('La petición especificada no existe.');
    error.statusCode = 404;
    throw error;
  }

  // Si es de tipo "THINGS" calculamos lo que queda
  if (ask.type === 'THINGS' && ask.quantityRequested) {
    // Sumamos todo lo que ya se ha entregado en Fulfillments anteriores
    const previousFulfillments = await prisma.fulfillment.aggregate({
      where: { askId: data.askId },
      _sum: { quantityDelivered: true } // Prisma hace la suma por nosotros
    });

    const totalDeliveredSoFar = previousFulfillments._sum.quantityDelivered || 0;
    const remaining = ask.quantityRequested - totalDeliveredSoFar;

    // Si la nueva donación supera lo que falta, bloqueamos con un Error 400
    if (data.quantityDelivered > remaining) {
      const error = new Error(`Donación excesiva. Solo faltan ${remaining} unidades para completar esta petición.`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Verificamos al Donante (Giver)
  const giver = await prisma.user.findUnique({
    where: { id: data.giverId }
  });

  if (!giver || giver.role !== 'GIVER') {
    const error = new Error('El usuario especificado no existe o no es GIVER.');
    error.statusCode = 403;
    throw error;
  }

  //Registramos la entrega (Fulfillment)
  const newFulfillment = await prisma.fulfillment.create({
    data: {
      askId: data.askId,
      giverId: data.giverId,
      quantityDelivered: data.quantityDelivered,
      expertNotes: data.expertNotes,
    }
  });

  return newFulfillment;
};

module.exports = {
  createFulfillment,
};