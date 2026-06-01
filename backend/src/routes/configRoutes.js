const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /api/config - Público (todos pueden leer la config para la UI)
router.get('/', configController.getConfigController);

// PUT /api/config - Protegido (solo ADMIN)
router.put('/', authMiddleware, roleMiddleware(['ADMIN']), configController.updateConfigController);

module.exports = router;
