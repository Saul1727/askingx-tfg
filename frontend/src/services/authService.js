/**
 * Authentication Service
 * Handles API calls related to user authentication.
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Authenticates a user against the backend API.
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} The parsed response data from the backend
 * @throws {Error} If the response is not OK or the request fails
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

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
