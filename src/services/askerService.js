const prisma = require('../config/prisma');

const createAsker = async (askerData) => {

    const author = await prisma.user.findUnique({
        where: { id: askerData.askAuthorId }
    });

    if (!author || author.role !== 'AUTHOR') {
        const error = new Error('El AskAuthor especificado no existe');
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

module.exports = {
    createAsker,
};