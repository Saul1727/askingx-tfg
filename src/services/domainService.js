const prisma = require('../config/prisma');

const getAllActiveDomains = async () => {
  const domains = await prisma.domain.findMany({
    where: {
      isActive: true // Solo queremos los activos para el desplegable del Frontend
    },
    orderBy: {
      name: 'asc' // Ordenados alfabéticamente para mejor UX
    }
  });

  return domains;
};

module.exports = {
  getAllActiveDomains
};