const express = require('express');
const { getAllDomainsController } = require('../controllers/domainController');

const router = express.Router();

// GET /api/domains -> Devuelve la lista de categorías
router.get('/', getAllDomainsController);

module.exports = router;