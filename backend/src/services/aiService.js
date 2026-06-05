/**
 * aiService.js
 * -----------------------------------------------------------------------------
 * Servicio AISLADO de generación de texto con IA (CU-05).
 *
 * Toda la lógica de "hablar con la IA" vive aquí y SOLO aquí. El resto de la
 * aplicación llama a `generateStoryText(datos)` sin saber qué proveedor hay
 * detrás. Gracias a esto, cambiar de Gemini a OpenAI o Claude en el futuro
 * solo afecta a este archivo.
 *
 * Comportamiento:
 *   - Si existe GEMINI_API_KEY en el .env  -> usa la IA real (Google Gemini).
 *   - Si NO existe la clave                -> genera la historia con una
 *     plantilla local (coste 0). Así la funcionalidad sigue operativa en
 *     desarrollo / demo sin gastar tokens.
 * -----------------------------------------------------------------------------
 */

// Modelo gratuito de Google Gemini (capa gratuita en Google AI Studio).
// Nota: los nombres antiguos (gemini-1.5-flash) fueron retirados de la API v1beta.
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Construye el prompt estructurado que se envía a la IA.
 * Recibe los datos ya compilados de la petición (Ask), la entidad (Asker),
 * los donantes (Givers) y las entregas (Fulfillments).
 */
const buildPrompt = (data) => {
  const donantes = data.givers.length > 0
    ? data.givers.map((g) => g.fullName).join(', ')
    : 'donantes anónimos';

  // Resumimos las entregas para dar contexto concreto a la IA.
  const entregas = data.fulfillments
    .map((f) => `- ${f.giver}: ${f.detalle}`)
    .join('\n');

  return `Eres el community manager de una plataforma solidaria llamada "${data.plataforma}".
Redacta una breve historia de impacto (entre 80 y 130 palabras) para redes sociales que
celebre cómo se ha resuelto una necesidad real. El tono debe ser cercano, emotivo y
positivo, pero sin inventar datos que no se te den. No uses hashtags ni emojis.

DATOS REALES DE LA AYUDA:
- Entidad beneficiaria: ${data.asker}
- Necesidad cubierta: "${data.titulo}"
- Descripción: ${data.descripcion}
- Tipo de ayuda: ${data.tipo}
- Personas/empresas donantes: ${donantes}
- Entregas realizadas:
${entregas || '- Ayuda completada'}

Devuelve únicamente el texto de la publicación, sin títulos ni comillas.`;
};

/**
 * Plantilla local de respaldo (sin IA externa, coste 0).
 * Se usa cuando no hay GEMINI_API_KEY configurada.
 */
const buildFallbackStory = (data) => {
  const donantes = data.givers.length > 0
    ? data.givers.map((g) => g.fullName).join(', ')
    : 'nuestra comunidad de donantes';

  return `¡Una necesidad más resuelta gracias a la solidaridad! ${data.asker} planteó una ` +
    `petición de tipo ${data.tipo.toLowerCase()}: "${data.titulo}". ` +
    `${data.descripcion} ` +
    `Gracias a la implicación de ${donantes}, la ayuda se ha completado con éxito. ` +
    `Cada gesto cuenta y demuestra que, cuando nos unimos, transformamos realidades. ` +
    `Gracias a todas las personas que hacen posible que en ${data.plataforma} ninguna ` +
    `necesidad se quede sin respuesta.`;
};

/**
 * Llama a la API de Gemini con el prompt y devuelve el texto generado.
 * Si la llamada falla por cualquier motivo, propagamos el error para que
 * el servicio que la usa decida (en nuestro caso, caer al fallback).
 */
const callGemini = async (prompt, apiKey) => {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(`Gemini respondió ${response.status}: ${detalle}`);
  }

  const json = await response.json();
  // La respuesta de Gemini anida el texto en candidates[0].content.parts[0].text
  const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('Gemini no devolvió texto utilizable.');

  return texto.trim();
};

/**
 * Punto de entrada público del servicio.
 * Decide entre IA real o plantilla local según haya o no API key.
 * @param {object} data - Datos compilados de la petición (ver buildPrompt).
 * @returns {Promise<string>} El texto de la historia generada.
 */
const generateStoryText = async (data) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Sin clave -> modo gratuito con plantilla local.
  if (!apiKey) {
    console.log('ℹ️  [IA] Sin GEMINI_API_KEY: generando historia con plantilla local.');
    return buildFallbackStory(data);
  }

  // Con clave -> intentamos IA real; si falla, no rompemos: usamos el fallback.
  try {
    const prompt = buildPrompt(data);
    return await callGemini(prompt, apiKey);
  } catch (error) {
    console.error('❌ [IA] Error llamando a Gemini, uso plantilla local:', error.message);
    return buildFallbackStory(data);
  }
};

module.exports = { generateStoryText };
