const express = require('express');
const { createAskerController } = require('../controllers/askerController');

const router = express.Router();

// POST /api/askers
router.post('/', createAskerController);

module.exports = router;