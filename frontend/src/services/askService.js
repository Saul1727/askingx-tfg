/**
 * Ask Service (Frontend)
 * Handles API calls to the backend for everything related to Asks.
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Helper to get the auth token from localStorage
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Helper to get the current user ID from the JWT token
 */
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    return payload.userId;
  } catch (e) {
    return null;
  }
};

/**
 * Creates a new Ask in the system
 */
export const createAsk = async (askData) => {
  const response = await fetch(`${API_BASE_URL}/asks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(askData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al crear la petición');
  return data;
};

/**
 * Retrieves all Asks, optionally filtered by status
 */
export const getAsks = async (status = '') => {
  const url = status ? `${API_BASE_URL}/asks?status=${status}` : `${API_BASE_URL}/asks`;
  const response = await fetch(url, {
    headers: getAuthHeader(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al recuperar las peticiones');
  return data.data || data;
};

/**
 * Updates an Ask completely (PUT)
 */
export const updateAsk = async (id, askData) => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(askData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar la petición');
  return data;
};

/**
 * Updates the status of an Ask (PATCH)
 */
export const updateAskStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar el estado');
  return data;
};

/**
 * Performs a match between an Ask and a Giver (PATCH)
 */
export const matchAsk = async (id, giverId) => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}/match`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ giverId }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al realizar el match');
  return data;
};

/**
 * Retrieves askers associated with the current author
 */
export const getAskers = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const response = await fetch(`${API_BASE_URL}/askers/author/${userId}`, {
    headers: getAuthHeader(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al obtener organizaciones');
  return data.data || data;
};

/**
 * Retrieves all help domains
 */
export const getDomains = async () => {
  const response = await fetch(`${API_BASE_URL}/domains`, {
    headers: getAuthHeader(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al obtener dominios');
  return data.data || data;
};
