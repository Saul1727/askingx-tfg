const express = require('express');
const { createAskController } = require('../controllers/askController');

const router = express.Router();

// POST /api/asks
router.post('/', createAskController);

module.exports = router;