 const express = require('express');
const { createFulfillmentController } = require('../controllers/fulfillmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Token requerido
router.use(authMiddleware);

// POST /api/fulfillments. 
// Solo el CONNECTOR (que hace el match) o el AUTHOR (que gestiona el caso).
router.post('/', roleMiddleware(['ADMIN', 'CONNECTOR', 'AUTHOR']), createFulfillmentController);

module.exports = router;