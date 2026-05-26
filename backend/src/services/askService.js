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
            status: 'CREATED',
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
    // Construimos el objeto de consulta para Prisma
    const query = {
        include: {
            asker: true, // Incluimos datos del Asker
            domain: true, // Incluimos los dominio asociado
            fulfillments: true, // Para que el front veas las donaciones
            givers: { select: { id: true, fullName: true } } // Incluimos los givers asignados
        },
        where: {}
    };

    // VISIBILIDAD por roles

    // ADMIN
    if (user.role === 'ADMIN') {
        // Los ADMIN pueden ver todas las Asks, no aplicamos restricciones adicionales
        if (filters.status) {
            query.where.status = filters.status;
        }
    }

    // CONNECTOR (solo sus doominos)
    else if (user.role === 'CONNECTOR') {
        const connectorInfo = await prisma.user.findUnique({
            where: { id: user.userId },
            include: { specialties: true } 
        });

        const specialtyIds = connectorInfo?.specialties?.map(d => d.id) || [];

        // Regla de Negocio Corregida:
        // Un Connector solo puede ver la "Bolsa de trabajo" de peticiones que están en estado OPEN (listas para hacer match)
        // O bien, las peticiones que él mismo ya está gestionando (connectorId === user.userId), sin importar su estado actual.
        query.where.OR = [
            {
                status: 'OPEN',
                domainId: { in: specialtyIds }
            },
            {
                connectorId: user.userId
            }
        ];

        // Si el cliente envía un status específico, lo respetamos añadiéndolo al where global (Prisma lo evalúa como AND)
        if (filters.status) {
            query.where.status = filters.status;
        }
    }

    // AUTHOR (solo sus Asks)
    else if (user.role === 'AUTHOR') {
        query.where.askAuthorId = user.userId;
        if (filters.status) {
            query.where.status = filters.status;
        }
    }

    // GIVER (solo su historial FULFILLMENT)
    else if (user.role === 'GIVER') {
        query.where.fulfillments = {
            some: { giverId: user.userId }
        };
        if (filters.status) {
            query.where.status = filters.status;
        }
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

const matchAsk = async (askId, connectorId, giverIds) => {
    // Verificamos que la petición existe
    const ask = await prisma.ask.findUnique({
        where: { id: askId }
    });

    if (!ask) {
        const error = new Error('La petición especificada no existe');
        error.statusCode = 404;
        throw error;
    }

    // Verificamos que esté en estado OPEN o MATCHED (ya que ahora podemos editar matches existentes)
    if (ask.status !== 'OPEN' && ask.status !== 'MATCHED') {
        const error = new Error('La petición no está disponible para editar sus Givers.');
        error.statusCode = 400; // Bad Request
        throw error;
    }

    // Hacemos el Match actualizando la Ask
    // Si eliminan a todos los givers (array vacío), la petición vuelve a estar OPEN
    const newStatus = giverIds.length > 0 ? 'MATCHED' : 'OPEN';

    const updatedAsk = await prisma.ask.update({
        where: { id: askId },
        data: {
            status: newStatus,
            connector: { connect: { id: connectorId } }, // Registramos qué experto lo gestionó
            givers: { set: giverIds.map(id => ({ id })) } // Reemplaza la lista completa (añade/elimina)
        },
        include: {
            connector: { select: { id: true, fullName: true } }, // Para verlo en la respuesta
            givers: { select: { id: true, fullName: true } }
        }
    });

    return updatedAsk;
};


const updateAsk = async (askId, updateData, user) => {
    // 1. Verificamos que la Ask existe
    const existingAsk = await prisma.ask.findUnique({
        where: { id: askId }
    });

    if (!existingAsk) {
        const error = new Error('La petición especificada no existe');
        error.statusCode = 404;
        throw error;
    }

    // 2. Seguridad: Un AUTHOR solo puede editar sus propias Asks
    if (user.role === 'AUTHOR' && existingAsk.askAuthorId !== user.userId) {
        const error = new Error('No tienes permisos para modificar esta petición');
        error.statusCode = 403;
        throw error;
    }

    // 3. Realizamos la actualización
    const updatedAsk = await prisma.ask.update({
        where: { id: askId },
        data: {
            title: updateData.title,
            description: updateData.description,
            type: updateData.type,
            status: updateData.status,
            dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
            askerId: updateData.askerId,
            domainId: updateData.domainId,
            
            // Campos especializados (STI)
            quantityRequested: updateData.quantityRequested,
            estimatedHours: updateData.estimatedHours,
            requiredSkill: updateData.requiredSkill,
            serviceLocation: updateData.serviceLocation,
        }
    });

    return updatedAsk;
};

module.exports = { createAsk, getAllAsks, updateAsk, updateAskStatus, matchAsk };
