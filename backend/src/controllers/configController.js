const { z } = require('zod');
const configService = require('../services/configService');

const updateConfigSchema = z.object({
  installationName: z.string().min(1, 'El nombre de instalación es obligatorio'),
  platformUrl: z.string().url('La URL no es válida'),
  logoUrl: z.string().min(1, 'La URL del logo es obligatoria')
});

const getConfigController = async (req, res, next) => {
  try {
    const config = await configService.getConfig();
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

const updateConfigController = async (req, res, next) => {
  try {
    const validatedData = updateConfigSchema.parse(req.body);
    const updatedConfig = await configService.updateConfig(validatedData);
    
    res.status(200).json({
      success: true,
      message: 'Configuración actualizada con éxito',
      data: updatedConfig
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfigController,
  updateConfigController
};
