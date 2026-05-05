const express = require('express');
const { createAskController, getAllAsksController, updateAskStatusController } = require('../controllers/askController');

const router = express.Router();

// POST /api/asks
router.post('/', createAskController);
// GET /api/asks
router.get('/', getAllAsksController);

// PATCH /api/asks/:id/status
router.patch('/:id/status', updateAskStatusController);

module.exports = router;