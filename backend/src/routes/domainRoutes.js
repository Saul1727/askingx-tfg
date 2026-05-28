const express = require('express');
const { 
    getAllDomainsController,
    createDomainController,
    deleteDomainController
} = require('../controllers/domainController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// GET /api/domains -> Devuelve la lista de categorías
router.get('/', getAllDomainsController);

// POST /api/domains -> Protegido para que solo los ADMIN puedan crear dominios
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    createDomainController
);

// DELETE /api/domains/:id -> Protegido para que solo los ADMIN puedan eliminar dominios
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    deleteDomainController
);

module.exports = router;