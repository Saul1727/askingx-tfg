const prisma = require('../config/prisma');

const createFulfillment = async (data) => {
  // 1. Verificamos que la Petición (Ask) existe
  const ask = await prisma.ask.findUnique({
    where: { id: data.askId }
  });

  if (!ask) {
    const error = new Error('La petición (Ask) especificada no existe.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verificamos que el Donante (Giver) existe y tiene el rol correcto
  const giver = await prisma.user.findUnique({
    where: { id: data.giverId }
  });

  if (!giver || giver.role !== 'GIVER') {
    const error = new Error('El usuario especificado no existe o no tiene el rol GIVER.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Registramos la entrega (Fulfillment)
  const newFulfillment = await prisma.fulfillment.create({
    data: {
      askId: data.askId,
      giverId: data.giverId,
      quantityDelivered: data.quantityDelivered,
      expertNotes: data.expertNotes,
      // deliveryDate se pone solo por el @default(now()) de Prisma
    }
  });

  // Cuando existe un Fulfillment, la peticion pasa a MATCHED
  // Avisando al AskAuthor de que la monitorice
  await prisma.ask.update({
    where: { id: data.askId },
    data: { status: 'MATCHED' }
  });

  return newFulfillment;
};

module.exports = {
  createFulfillment,
};