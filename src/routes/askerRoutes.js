const express = require('express');
const { createAskerController, getAskersByAuthorController  } = require('../controllers/askerController');

const router = express.Router();

// POST /api/askers
router.post('/', createAskerController);

// GET /api/askers/:id
router.get('/author/:id', getAskersByAuthorController);


module.exports = router;