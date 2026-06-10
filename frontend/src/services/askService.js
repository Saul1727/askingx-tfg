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
export const getAllAsks = async (status = '') => {
  try {
    const url = status ? `${API_BASE_URL}/asks?status=${status}` : `${API_BASE_URL}/asks`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader()
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al recuperar las peticiones');
    
    return data.data || data;
  } catch (error) {
    console.error('GetAllAsks service error:', error);
    throw error;
  }
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
export const updateAskStatus = async (id, status, cancellationReason) => {
  const body = { status };
  if (cancellationReason) body.cancellationReason = cancellationReason;

  const response = await fetch(`${API_BASE_URL}/asks/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar el estado');
  return data;
};

/**
 * Performs a match between an Ask and one or more Givers (PATCH)
 */
export const matchAsk = async (id, giverIds) => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}/match`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ giverIds }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar voluntarios');
  return data;
};

/**
 * Registra una donación parcial (Fulfillment)
 */
export const createFulfillment = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/fulfillments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al registrar la donación parcial');
  return data.data;
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

// Añadir al final de askService.js
export const createAsker = async (askerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/askers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(askerData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear la organización');
    return data;
  } catch (error) {
    console.error('CreateAsker service error:', error);
    throw error;
  }
};

/**
 * Elimina un Asker (Organización/Persona)
 */
export const deleteAsker = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/askers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar la organización');
    return data;
  } catch (error) {
    console.error('DeleteAsker service error:', error);
    throw error;
  }
};

export const createDomain = async (domainData) => {
    const response = await fetch(`${API_BASE_URL}/domains`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(domainData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear el dominio');
    return data.data;
};

export const updateDomain = async (domainId, domainData) => {
    const response = await fetch(`${API_BASE_URL}/domains/${domainId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(domainData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar el dominio');
    return data.data;
};

export const deleteDomain = async (domainId) => {
    const response = await fetch(`${API_BASE_URL}/domains/${domainId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar el dominio');
    return data;
};

/**
 * Descartar una petición expirada
 */
export const discardAsk = async (id, cancellationReason = 'Descartada tras expiración') => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}/discard`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ cancellationReason }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al descartar la petición');
  return data.data;
};

/**
 * Republicar una petición expirada
 */
export const republishAsk = async (id, newDueDate) => {
  const response = await fetch(`${API_BASE_URL}/asks/${id}/republish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ newDueDate }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al republicar la petición');
  return data.data;
};


