 const express = require('express');
const { createFulfillmentController } = require('../controllers/fulfillmentController');

const router = express.Router();

// POST /api/fulfillments
router.post('/', createFulfillmentController);

module.exports = router;