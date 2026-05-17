const domainService = require('../services/domainService');

const getAllDomainsController = async (req, res, next) => {
  try {
    const domains = await domainService.getAllActiveDomains();

    res.status(200).json({
      success: true,
      message: 'Dominios temáticos recuperados con éxito',
      data: domains
    });
  } catch (error) {
    next(error); // Derivamos al errorHandler global
  }
};

module.exports = {
  getAllDomainsController
};