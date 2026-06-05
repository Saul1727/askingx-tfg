const cron = require('node-cron');
const prisma = require('../config/prisma');

const startCronJobs = () => {
    // Se ejecuta todos los días a las 00:00 (Medianoche)
    // El formato cron es: "Minutos Horas Día-del-Mes Mes Día-de-la-Semana"
    cron.schedule('0 0 * * *', async () => {
        console.log('⏳ [CRON] Ejecutando revisión diaria de peticiones caducadas...');
        try {
            const now = new Date();

            // Actualización masiva (updateMany) de peticiones vencidas
            const result = await prisma.ask.updateMany({
                where: {
                    status: {
                        in: ['OPEN', 'MATCHED'] // Solo caducan las que están pendientes
                    },
                    dueDate: {
                        lt: now // "lt" significa "less than" (menor que la fecha actual)
                    }
                },
                data: {
                    status: 'EXPIRED'
                }
            });

            console.log(`✅ [CRON] Revisión completada. Peticiones expiradas: ${result.count}`);
        } catch (error) {
            console.error('❌ [CRON] Error al expirar peticiones:', error);
        }
    });
};

module.exports = { startCronJobs };
