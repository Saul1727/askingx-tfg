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
export const updateUser = async (userId, updateData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al actualizar el usuario');
        return data;
    } catch (error) {
        console.error('updateUser service error:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil');
        return data.data;
    } catch (error) {
        console.error('updateUserProfile service error:', error);
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(passwordData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al cambiar la contraseña');
        return data;
    } catch (error) {
        console.error('changePassword service error:', error);
        throw error;
    }
};

export const resetUserPassword = async (userId, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ newPassword }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al restablecer la contraseña');
        return data;
    } catch (error) {
        console.error('resetUserPassword service error:', error);
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