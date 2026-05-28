const statsService = require('../services/statsService');

const getDashboardStatsController = async (req, res, next) => {
    try {
        const stats = await statsService.getDashboardStats();
        res.status(200).json({
            success: true,
            message: 'Estadísticas del dashboard recuperadas con éxito',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStatsController
};
