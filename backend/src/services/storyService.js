/**
 * storyService.js
 * -----------------------------------------------------------------------------
 * Lógica de negocio de las Historias de Impacto (CU-05).
 *
 * Una Story es una publicación generada por IA que resume cómo se resolvió una
 * petición (Ask) ya completada. Relación 1:1 con Ask (askId es único).
 *
 * Reglas principales:
 *   - Solo se puede generar si el Ask está FULFILLED y tiene al menos una entrega.
 *   - Quién puede generar/editar: el AUTHOR dueño de la petición o un ADMIN.
 *   - Quién ve cada historia (CU-05):
 *       · ADMIN     -> todas
 *       · AUTHOR    -> las de sus peticiones (borradores y publicadas)
 *       · CONNECTOR -> las publicadas de peticiones que él gestionó
 *       · GIVER     -> las publicadas de peticiones en las que entregó algo
 * -----------------------------------------------------------------------------
 */

const prisma = require('../config/prisma');
const { generateStoryText } = require('./aiService');
const { getConfig } = require('./configService');

/**
 * Comprueba si un usuario puede generar/editar la historia de una petición.
 * (AUTHOR dueño de la petición o ADMIN). Lanza error 403 si no.
 */
const assertCanManage = (ask, user) => {
  const esAdmin = user.role === 'ADMIN';
  const esAutorDueno = user.role === 'AUTHOR' && ask.askAuthorId === user.userId;
  if (!esAdmin && !esAutorDueno) {
    const error = new Error('No tienes permisos para gestionar la historia de esta petición.');
    error.statusCode = 403;
    throw error;
  }
};

/**
 * Genera (o regenera) la historia de una petición completada.
 * Hace "upsert": si ya existe historia para ese Ask, sobreescribe el texto;
 * si no, la crea como borrador (isPublished = false).
 */
const generateStory = async (askId, user) => {
  // 1. Recuperamos la petición con todos los datos que necesita el prompt.
  const ask = await prisma.ask.findUnique({
    where: { id: askId },
    include: {
      asker: true,
      givers: { select: { fullName: true } },
      fulfillments: {
        include: { giver: { select: { fullName: true } } },
      },
      story: true,
    },
  });

  if (!ask) {
    const error = new Error('La petición especificada no existe.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Seguridad y precondiciones del CU-05.
  assertCanManage(ask, user);

  if (ask.status !== 'FULFILLED') {
    const error = new Error('Solo se pueden generar historias de peticiones COMPLETADAS.');
    error.statusCode = 400;
    throw error;
  }
  if (!ask.fulfillments || ask.fulfillments.length === 0) {
    const error = new Error('La petición no tiene ninguna entrega registrada.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Compilamos los datos en un formato sencillo para el servicio de IA.
  const config = await getConfig();
  const datosParaIA = {
    plataforma: config.installationName,
    asker: ask.asker.organizationName || ask.asker.contactPerson,
    titulo: ask.title,
    descripcion: ask.description,
    tipo: ask.type,
    givers: ask.givers,
    fulfillments: ask.fulfillments.map((f) => ({
      giver: f.giver?.fullName || 'Donante',
      detalle: f.quantityDelivered != null
        ? `entregó ${f.quantityDelivered}`
        : (f.expertNotes || 'colaboró en la entrega'),
    })),
  };

  // 4. Llamamos a la IA (o al fallback local). Aquí no nos importa el proveedor.
  const generatedContent = await generateStoryText(datosParaIA);

  // 5. Guardamos en BD. Upsert: actualiza si existe, crea si no.
  const story = await prisma.story.upsert({
    where: { askId: askId },
    update: { generatedContent }, // regenerar solo cambia el texto, no el estado de publicación
    create: { askId: askId, generatedContent, isPublished: false },
  });

  return story;
};

/**
 * Devuelve la historia de una petición concreta (para "Ver historia").
 * Aplica el mismo control de permisos de gestión.
 */
const getStoryByAsk = async (askId, user) => {
  const story = await prisma.story.findUnique({
    where: { askId: askId },
    include: { ask: { include: { asker: true } } },
  });

  if (!story) {
    const error = new Error('Esta petición aún no tiene historia generada.');
    error.statusCode = 404;
    throw error;
  }

  assertCanManage(story.ask, user);
  return story;
};

/**
 * Lista las historias visibles para el usuario según su rol (ver cabecera).
 */
const getStories = async (user) => {
  // Construimos el filtro 'where' según el rol.
  let where;
  switch (user.role) {
    case 'ADMIN':
      where = {}; // todas
      break;
    case 'AUTHOR':
      // Las de las peticiones que él creó (borradores incluidos).
      where = { ask: { askAuthorId: user.userId } };
      break;
    case 'CONNECTOR':
      // Solo publicadas de peticiones que él gestionó.
      where = { isPublished: true, ask: { connectorId: user.userId } };
      break;
    case 'GIVER':
      // Solo publicadas de peticiones en las que registró alguna entrega.
      where = { isPublished: true, ask: { fulfillments: { some: { giverId: user.userId } } } };
      break;
    default:
      where = { id: '__ninguna__' }; // por seguridad, no devolvemos nada
  }

  const stories = await prisma.story.findMany({
    where,
    include: {
      ask: {
        include: { asker: { select: { organizationName: true, contactPerson: true } } },
      },
    },
    orderBy: { generatedAt: 'desc' },
  });

  return stories;
};

/**
 * Edita el texto y/o el estado de publicación de una historia.
 * Solo AUTHOR dueño o ADMIN.
 */
const updateStory = async (storyId, data, user) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { ask: true },
  });

  if (!story) {
    const error = new Error('La historia especificada no existe.');
    error.statusCode = 404;
    throw error;
  }

  assertCanManage(story.ask, user);

  const updated = await prisma.story.update({
    where: { id: storyId },
    data: {
      // Solo actualizamos los campos que llegan (edición parcial).
      generatedContent: data.generatedContent ?? story.generatedContent,
      isPublished: data.isPublished ?? story.isPublished,
      // imageUrl: si llega cadena vacía, se interpreta como "quitar imagen" (vuelve al logo por defecto).
      imageUrl: data.imageUrl !== undefined ? (data.imageUrl || null) : story.imageUrl,
    },
  });

  return updated;
};

module.exports = {
  generateStory,
  getStoryByAsk,
  getStories,
  updateStory,
};
