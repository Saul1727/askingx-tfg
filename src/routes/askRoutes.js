const express = require('express');
const { createAskController, getAllAsksController, updateAskStatusController } = require('../controllers/askController');
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

module.exports = router;