const { z } = require('zod');
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

const createDomainController = async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(3, "El nombre del dominio es requerido."),
            description: z.string().optional()
        });
        const validatedData = schema.parse(req.body);
        const newDomain = await domainService.createDomain(validatedData);
        res.status(201).json({
            success: true,
            message: 'Dominio creado con éxito',
            data: newDomain
        });
    } catch (error) {
        next(error);
    }
};

const deleteDomainController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await domainService.deleteDomain(id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  getAllDomainsController,
  createDomainController,
  deleteDomainController
};