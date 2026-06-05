const prisma = require('../config/prisma');

const createAsker = async (askerData) => {
    const author = await prisma.user.findUnique({
        where: { id: askerData.askAuthorId }
    });

    if (!author || (author.role !== 'AUTHOR' && author.role !== 'ADMIN')) {
        const error = new Error('El AskAuthor especificado no existe o no tiene permisos de creación (AUTHOR/ADMIN)');
        error.statusCode = 404; // Not Found
        throw error;
    }
    
    const newAsker = await prisma.asker.create({
        data: {
            contactPerson: askerData.contactPerson,
            organizationName: askerData.organizationName,
            phone: askerData.phone,
            email: askerData.email,
            address: askerData.address,
            askAuthorId: askerData.askAuthorId,
        },
    });

    return newAsker;
};

const getAskersByAuthor = async (authorId, userRole) => {
    // Si el usuario es ADMIN, devolvemos todos los Askers sin filtrar por autor
    const whereClause = userRole === 'ADMIN' ? {} : { askAuthorId: authorId };

    const askers = await prisma.asker.findMany({
        where: whereClause,
        include: {
            asks: {
                select: {
                    id: true,
                    title: true,
                    status: true
                }
            }
        },
        orderBy: { 
            createdAt: 'desc' 
        }
    });

    return askers;
};

// Recibimos askerId, userId y userRole
const deleteAsker = async (askerId, userId, userRole) => {
    // Buscamos el Asker y contamos cuántas Asks tiene asociadas
    const asker = await prisma.asker.findUnique({
        where: { id: askerId },
        include: {
            _count: {
                select: { asks: true }
            }
        }
    });

    // Validaciones de existencia
    if (!asker) {
        const error = new Error('La organización no existe');
        error.statusCode = 404;
        throw error;
    }

    // Regla de Permisos (Admin o Dueño)
    if (userRole !== 'ADMIN' && asker.askAuthorId !== userId) {
        const error = new Error('No tienes permisos para eliminar esta organización');
        error.statusCode = 403; 
        throw error;
    }

    // No se puede borrar si tiene peticiones
    if (asker._count.asks > 0) {
        const error = new Error('No puedes eliminar una organización que ya tiene peticiones en el sistema. Debes cancelar o eliminar sus peticiones primero.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    // Si todo está OK, eliminamos
    await prisma.asker.delete({
        where: { id: askerId }
    });

    return true;
};

module.exports = {
    createAsker,
    getAskersByAuthor,
    deleteAsker 
};