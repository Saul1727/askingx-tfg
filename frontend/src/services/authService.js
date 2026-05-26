/**
 * Authentication Service
 * Handles API calls related to user authentication.
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Authenticates a user against the backend API.
 * 
 * @param {Object} credentials - User's credentials {email, password}
 * @returns {Promise<Object>} The parsed response data from the backend
 * @throws {Error} If the response is not OK or the request fails
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Error de red o respuesta inválida del servidor' };
    }

    if (!response.ok) {
      // Use the error message from the backend if available, otherwise a generic one
      const errorMessage = data.message || `Error ${response.status}: Error en el inicio de sesión`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const isAuthenticated = () => {
  return !!getToken();
};

