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

  let totalDeliveredSoFar = 0;
  let remaining = 0;
  let isComplete = false;

  // Si es de tipo "THINGS" o "TIME" calculamos lo que queda
  if ((ask.type === 'THINGS' && ask.quantityRequested) || (ask.type === 'TIME' && ask.estimatedHours)) {
    // Sumamos todo lo que ya se ha entregado en Fulfillments anteriores
    const previousFulfillments = await prisma.fulfillment.aggregate({
      where: { askId: data.askId },
      _sum: { quantityDelivered: true } // Prisma hace la suma por nosotros
    });

    totalDeliveredSoFar = previousFulfillments._sum.quantityDelivered || 0;
    const target = ask.type === 'THINGS' ? ask.quantityRequested : ask.estimatedHours;
    remaining = target - totalDeliveredSoFar;

    // Si la nueva donación supera lo que falta, bloqueamos con un Error 400
    if (data.quantityDelivered > remaining) {
      const error = new Error(`Donación excesiva. Solo faltan ${remaining} para completar esta petición.`);
      error.statusCode = 400;
      throw error;
    }

    // Verificamos si con esta entrega se alcanza exactamente el 100%
    if (data.quantityDelivered === remaining) {
      isComplete = true;
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

  // Registramos la entrega (Fulfillment) y actualizamos estado si se completa (Transacción atómica)
  const newFulfillment = await prisma.$transaction(async (tx) => {
    const fulfillment = await tx.fulfillment.create({
      data: {
        askId: data.askId,
        giverId: data.giverId,
        quantityDelivered: data.quantityDelivered,
        expertNotes: data.expertNotes,
      }
    });

    // Si alcanzamos el 100%, o si es un servicio/expertise (que es unitario), la marcamos completada
    if (isComplete || ask.type === 'EXPERTISE' || ask.type === 'SERVICES') {
      await tx.ask.update({
        where: { id: data.askId },
        data: { status: 'FULFILLED' }
      });
    }

    return fulfillment;
  });

  return newFulfillment;
};

module.exports = {
  createFulfillment,
};