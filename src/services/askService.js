const prisma = require('../config/prisma');

const createAsk = async (askData) => {
    // 1. Verificamos que el Asker existe
    const asker = await prisma.asker.findUnique({
        where: { id: askData.askerId }
    });

    if (!asker) {
        const error = new Error('El Solicitante (Asker) especificado no existe');
        error.statusCode = 404;
        throw error;
    }

    // 2. Verificamos que el AskAuthor existe y es un AUTHOR
    const author = await prisma.user.findUnique({
        where: { id: askData.askAuthorId }
    });

    if (!author || author.role !== 'AUTHOR') {
        const error = new Error('El autor especificado no existe o no es un AUTHOR');
        error.statusCode = 404;
        throw error;
    }

    // 3. Creamos la Ask en estado inicial CREATED
    const newAsk = await prisma.ask.create({
        data: {
            title: askData.title,
            description: askData.description,
            type: askData.type,
            status: 'OPEN',
            dueDate: askData.dueDate ? new Date(askData.dueDate) : null,
            askerId: askData.askerId,
            askAuthorId: askData.askAuthorId,
            domainId: askData.domainId,

            //Campos especializados (Single Table Inheritance)
            quantityRequested: askData.quantityRequested,
            estimatedHours: askData.estimatedHours,
            requiredSkill: askData.requiredSkill,
            serviceLocation: askData.serviceLocation,
        }
    });

    return newAsk;
};

const getAllAsks = async (user, filters = {}) => {
    //Construimos el objeto de consulta para Prisma
    const query = {
        include: {
            asker: true, // Incluimos datos del Asker
            domain: true, // Incluimos los dominio asociado
            fulfillments: true // Para que el front veas las donaciones
    },
    where: {}
};

//Si hay estado aplicamos el filtro
if (filters.status) {
    query.where.status = filters.status ;
}

// VISIBILIDAD por roles

// ADMIN
if (user.role === 'ADMIN') {
    // Los ADMIN pueden ver todas las Asks, no aplicamos restricciones adicionales
}

// CONNECTOR (solo sus doominos)
else if (user.role === 'CONNECTOR') {

    const connectorInfo = await prisma.connector.findUnique({
        where: { id: user.userId },
        include: { specialties: true } 
    });

   const specialtyIds = connectorInfo.specialties?.map(d => d.id) || [];

        query.where.OR = [
            { 
                status: 'OPEN',
                domainId: { in: specialtyIds } // Solo ve lo de su especialidad
            }, 
            { connectorId: user.userId }
        ];
}

// AUTHOR (solo sus Asks)
else if (user.role === 'AUTHOR') {
    query.where.askAuthorId = user.userId;
}

// GIVER (solo su historial FULFILLMENT)
else if (user.role === 'GIVER') {
    query.where.fulfillments = {
        some: { giverId: user.userId }
    };
}

// Consulta con reglas aplicadas
const asks = await prisma.ask.findMany(query);
return asks;
};

const updateAskStatus = async (askId, newStatus, user) => {
    // Verificamos que la Ask existe
    const existingAsk = await prisma.ask.findUnique({
        where: { id: askId }
    });

    if (!existingAsk) {
        const error = new Error('La Ask especificada no existe');
        error.statusCode = 404;
        throw error;
    }

    // Un AUTHOR solo puede actualizar el estado de sus propias Asks
    if (user.role === 'AUTHOR' && existingAsk.askAuthorId !== user.userId) {
        const error = new Error('No tienes permisos para actualizar el estado de esta petición');
        error.statusCode = 403;
        throw error;
    }

    // Actualizamos el estado de la Ask
    const updatedAsk = await prisma.ask.update({
        where: { id: askId },
        data: { status: newStatus }
    });

    return updatedAsk;
};

module.exports = { createAsk, getAllAsks, updateAskStatus };