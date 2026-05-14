const express = require('express');
const { createAskerController, getAskersByAuthorController  } = require('../controllers/askerController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de este router requieren autenticación 
router.use(authMiddleware);

// POST /api/askers -> Solo un AUTHOR puede registrar un nuevo vulnerable
router.post('/', roleMiddleware(['AUTHOR']), createAskerController);

// GET /api/askers/author/:id -> Para leer los vulnerables de un autor específico
router.get('/author/:id', getAskersByAuthorController);


module.exports = router;