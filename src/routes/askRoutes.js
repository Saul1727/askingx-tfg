const express = require('express');
const { createAskController, getAllAsksController } = require('../controllers/askController');

const router = express.Router();

// POST /api/asks
router.post('/', createAskController);
// GET /api/asks
router.get('/', getAllAsksController);

module.exports = router;