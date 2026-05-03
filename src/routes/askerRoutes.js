const express = require('express');
const { createAskerController, getAskersByAuthorController  } = require('../controllers/askerController');

const router = express.Router();

// POST /api/askers -> Para registrar un nuevo vulnerable
router.post('/', createAskerController);

// GET /api/askers/author/:id -> Para leer los vulnerables de un autor específico
router.get('/author/:id', getAskersByAuthorController);


module.exports = router;