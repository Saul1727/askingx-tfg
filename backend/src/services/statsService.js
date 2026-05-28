const prisma = require('../config/prisma');

/**
 * Gathers and computes various statistics for the admin dashboard.
 * @returns {Promise<object>} An object containing dashboard statistics:
 * - {number} completedThisMonth: Total asks fulfilled in the current calendar month.
 * - {number} pendingAsks: Total asks currently in 'OPEN' or 'CREATED' status.
 * - {number} expiredAsks: Total asks marked as 'EXPIRED'.
 * - {Array<object>} activeConnectors: A list of the top 5 most active connectors.
 */
const getDashboardStats = async () => {
    // --- 1. Total asks fulfilled in the current month ---
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const completedThisMonth = await prisma.ask.count({
        where: {
            status: 'FULFILLED',
            updatedAt: {
                gte: startOfMonth,
                lt: endOfMonth,
            },
        },
    });

    // --- 2. Total pending asks (Open or Created) ---
    const pendingAsks = await prisma.ask.count({
        where: {
            status: {
                in: ['OPEN', 'CREATED'],
            },
        },
    });

    // --- 3. Total expired asks ---
    const expiredAsks = await prisma.ask.count({
        where: {
            status: 'EXPIRED',
        },
    });

    // --- 4. Top 5 most active Connectors ---
    // This query finds users with the 'CONNECTOR' role, counts their related 'asksConnected',
    // orders them by that count, and takes the top 5.
    const activeConnectors = await prisma.user.findMany({
        where: {
            role: 'CONNECTOR',
        },
        select: {
            id: true,
            fullName: true,
            _count: {
                select: {
                    asksConnected: true,
                },
            },
        },
        orderBy: {
            asksConnected: {
                _count: 'desc',
            },
        },
        take: 5,
    });

    // We return a structured object with all the calculated stats.
    return {
        completedThisMonth,
        pendingAsks,
        expiredAsks,
        // We map the raw query result to a cleaner structure for the frontend.
        activeConnectors: activeConnectors.map(c => ({
            id: c.id,
            fullName: c.fullName,
            askCount: c._count.asksConnected
        })),
    };
};

module.exports = {
    getDashboardStats,
};
