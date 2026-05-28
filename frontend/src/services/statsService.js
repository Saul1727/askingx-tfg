const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/summary`, {
            method: 'GET',
            headers: { ...getAuthHeader() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error cargando las estadísticas');
        return data.data || {};
    } catch (error) {
        console.error('getDashboardStats service error:', error);
        throw error;
    }
};
