/**
 * storyService.js (Frontend)
 * -----------------------------------------------------------------------------
 * Llamadas a la API de Historias de Impacto (CU-05).
 * Sigue el mismo patrón que el resto de servicios del frontend.
 * -----------------------------------------------------------------------------
 */

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Genera (o regenera) la historia de una petición completada.
 */
export const generateStory = async (askId) => {
  const response = await fetch(`${API_BASE_URL}/stories/generate/${askId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al generar la historia');
  return data.data;
};

/**
 * Lista todas las historias visibles para el usuario actual (el backend filtra por rol).
 */
export const getStories = async () => {
  const response = await fetch(`${API_BASE_URL}/stories`, {
    headers: { ...getAuthHeader() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar las historias');
  return data.data || [];
};

/**
 * Recupera la historia de una petición concreta (para "Ver historia").
 * Devuelve null si la petición todavía no tiene historia (404).
 */
export const getStoryByAsk = async (askId) => {
  const response = await fetch(`${API_BASE_URL}/stories/by-ask/${askId}`, {
    headers: { ...getAuthHeader() },
  });
  if (response.status === 404) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al cargar la historia');
  return data.data;
};

/**
 * Edita el texto y/o el estado de publicación de una historia.
 * @param {string} id - ID de la historia.
 * @param {object} payload - { generatedContent?, isPublished? }
 */
export const updateStory = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al actualizar la historia');
  return data.data;
};
