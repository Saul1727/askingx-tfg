 const express = require('express');
const { createFulfillmentController } = require('../controllers/fulfillmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Token requerido
router.use(authMiddleware);

// POST /api/fulfillments - GIVER, CONNECTOR Y AUTHOR pueden crear un fulfillment
router.post('/', roleMiddleware(['GIVER', 'CONNECTOR', 'AUTHOR']), createFulfillmentController);

module.exports = router;