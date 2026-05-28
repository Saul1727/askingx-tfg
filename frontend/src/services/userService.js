const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getGivers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/givers`, {
            method: 'GET',
            headers: { ...getAuthHeader() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error cargando voluntarios');
        return data.data || data;
    } catch (error) {
        console.error('getGivers service error:', error);
        throw error;
    }
    };

    export const updateUser = async (userId, userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error actualizando el usuario');
        return data.data;
    } catch (error) {
        console.error('updateUser service error:', error);
        throw error;
    }
    };
    export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error creando el usuario');
        return data.data;
    } catch (error) {
        console.error('createUser service error:', error);
        throw error;
    }
    };
    export const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: { ...getAuthHeader() },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error cargando usuarios');
        return data.data || [];
    } catch (error) {
        console.error('getAllUsers service error:', error);
        throw error;
    }
    };