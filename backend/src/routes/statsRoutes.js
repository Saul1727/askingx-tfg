const express = require('express');
const { getDashboardStatsController } = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// GET /api/stats/summary -> Protegido para que solo los ADMIN puedan ver las estadísticas
router.get(
    '/summary',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    getDashboardStatsController
);

module.exports = router;
