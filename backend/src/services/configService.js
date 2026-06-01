const prisma = require('../config/prisma');

const getConfig = async () => {
  let config = await prisma.appConfig.findUnique({
    where: { id: 'global' }
  });

  if (!config) {
    config = await prisma.appConfig.create({
      data: {
        id: 'global',
        installationName: 'AskingX',
        platformUrl: 'http://localhost:5173',
        logoUrl: '/favicon.svg'
      }
    });
  }

  return config;
};

const updateConfig = async (updateData) => {
  // Ensure the config exists first
  await getConfig();
  
  const updatedConfig = await prisma.appConfig.update({
    where: { id: 'global' },
    data: {
      installationName: updateData.installationName,
      platformUrl: updateData.platformUrl,
      logoUrl: updateData.logoUrl
    }
  });

  return updatedConfig;
};

module.exports = {
  getConfig,
  updateConfig
};
