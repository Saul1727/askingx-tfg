const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAppConfig = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/config`, {
            method: 'GET',
            headers: { ...getAuthHeader() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error cargando la configuración');
        return data.data;
    } catch (error) {
        console.error('Error en getAppConfig:', error);
        throw error;
    }
};

export const updateAppConfig = async (configData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/config`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(configData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error actualizando la configuración');
        return data.data;
    } catch (error) {
        console.error('Error en updateAppConfig:', error);
        throw error;
    }
};
