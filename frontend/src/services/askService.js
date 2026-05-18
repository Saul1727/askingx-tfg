/**
 * Ask Service
 * Handles API communications related to petitions (Asks).
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Sends a POST request to create a new petition.
 * @param {Object} askData - The data collected from the form.
 * @returns {Promise<Object>} The server response.
 */
export const createAsk = async (askData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No se encontró un token de sesión. Por favor, inicie sesión de nuevo.');
  }

  const response = await fetch(`${API_BASE_URL}/asks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(askData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Return the error message from the backend or a default one
    throw new Error(data.message || 'Error al crear la petición');
  }

  return data;
};
