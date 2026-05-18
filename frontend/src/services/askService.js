/**
 * Ask Service
 * Handles API communications related to petitions (Asks).
 */

const API_BASE_URL = 'http://localhost:3000/api';

export const createAsk = async (askData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No se encontró un token de sesión.');

  const response = await fetch(`${API_BASE_URL}/asks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(askData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al crear la petición');
  return data;
};

// --- GETTERS PARA LOS DESPLEGABLES ---

export const getAskers = async () => {
  const token = localStorage.getItem('token');
  if (!token) return [];

  // TRUCO SENIOR: Decodificamos el JWT a mano para sacar tu userId
  const payloadBase64 = token.split('.')[1];
  const decodedJson = atob(payloadBase64);
  const payload = JSON.parse(decodedJson);
  const authorId = payload.userId; // Este es tu ID de sesión

  // Llamamos a la ruta real de tu backend que requiere el ID
  const response = await fetch(`${API_BASE_URL}/askers/author/${authorId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) throw new Error('Error al obtener organizaciones');
  
  const json = await response.json();
  return Array.isArray(json) ? json : (json.data || json.askers || []);
};

export const getDomains = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/domains`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Error al obtener dominios');
  
  const json = await response.json();
  return Array.isArray(json) ? json : (json.data || json.domains || []);
};