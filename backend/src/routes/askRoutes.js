const express = require('express');
const { 
    createAskController, 
    getAllAsksController, 
    updateAskController, 
    updateAskStatusController, 
    matchAskController,
    discardAskController,
    republishAskController 
} = require('../controllers/askController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de este archivo requieren Token
router.use(authMiddleware);

// GET /api/asks
router.get('/', getAllAsksController);

// POST /api/asks Solo un AUTHOR puede crear un Ask
router.post('/', roleMiddleware(['AUTHOR']), createAskController);

// PATCH /api/asks/:id/status - Transicion de estados (Human-in-the-loop)
router.patch('/:id/status', roleMiddleware(['AUTHOR', 'ADMIN','CONNECTOR']), updateAskStatusController);

// Ruta para que un experto asigne un donante a una petición
router.patch('/:id/match', roleMiddleware(['CONNECTOR']), matchAskController);

// PUT /api/asks/:id - Edición completa de la petición (desde el formulario)
router.put('/:id', roleMiddleware(['AUTHOR', 'ADMIN']), updateAskController);

// --- RUTAS CU-10: GESTIÓN DE EXPIRACIÓN ---

// PUT /api/asks/:id/discard - Descartar una petición caducada
router.put('/:id/discard', roleMiddleware(['AUTHOR', 'ADMIN']), discardAskController);

// POST /api/asks/:id/republish - Republicar una petición caducada
router.post('/:id/republish', roleMiddleware(['AUTHOR', 'ADMIN']), republishAskController);

module.exports = router;