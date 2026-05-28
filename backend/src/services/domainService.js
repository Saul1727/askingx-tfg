const prisma = require('../config/prisma');

/**
 * Retrieves all active domains, sorted alphabetically.
 * @returns {Promise<Array<object>>} A list of active domain objects.
 */
const getAllActiveDomains = async () => {
  const domains = await prisma.domain.findMany({
    where: {
      isActive: true // We only want active domains for frontend dropdowns, etc.
    },
    orderBy: {
      name: 'asc' // Alphabetical sort for better UX
    }
  });

  return domains;
};

/**
 * Creates a new domain.
 * @param {object} domainData - The data for the new domain.
 * @param {string} domainData.name - The name of the domain.
 * @param {string} [domainData.description] - An optional description.
 * @returns {Promise<object>} The created domain object.
 */
const createDomain = async (domainData) => {
    const newDomain = await prisma.domain.create({
        data: {
            name: domainData.name,
            description: domainData.description || null,
        }
    });
    return newDomain;
};

/**
 * Deletes a domain after checking for dependencies.
 * @param {string} domainId - The ID of the domain to delete.
 * @returns {Promise<{message: string}>} A success message.
 * @throws {Error} If the domain is in use by existing asks.
 */
const deleteDomain = async (domainId) => {
    // Safety check: prevent deletion if the domain is linked to any asks.
    const existingAsks = await prisma.ask.count({
        where: { domainId: domainId }
    });

    if (existingAsks > 0) {
        const error = new Error('No se puede eliminar el dominio porque está siendo utilizado por peticiones existentes.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    await prisma.domain.delete({
        where: { id: domainId }
    });

    return { message: 'Dominio eliminado con éxito' };
};

module.exports = {
  getAllActiveDomains,
  createDomain,
  deleteDomain
};