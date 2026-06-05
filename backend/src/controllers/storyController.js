/**
 * storyController.js
 * -----------------------------------------------------------------------------
 * Capa de control de las Historias de Impacto (CU-05).
 * Valida la entrada con Zod y delega toda la lógica al storyService.
 * -----------------------------------------------------------------------------
 */

const { z } = require('zod');
const storyService = require('../services/storyService');

// Esquema para editar una historia: ambos campos son opcionales (edición parcial).
const updateStorySchema = z.object({
  generatedContent: z.string().min(10, 'El contenido es demasiado corto').optional(),
  isPublished: z.boolean().optional(),
});

// POST /api/stories/generate/:askId -> genera o regenera la historia
const generateStoryController = async (req, res, next) => {
  try {
    const { askId } = req.params;
    z.string().uuid('El ID de la petición debe ser un UUID válido').parse(askId);

    const story = await storyService.generateStory(askId, req.user);

    res.status(201).json({
      success: true,
      message: 'Historia generada con éxito',
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stories -> lista las historias visibles para el usuario (filtradas por rol)
const getStoriesController = async (req, res, next) => {
  try {
    const stories = await storyService.getStories(req.user);
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    next(error);
  }
};

// GET /api/stories/by-ask/:askId -> devuelve la historia de una petición concreta
const getStoryByAskController = async (req, res, next) => {
  try {
    const { askId } = req.params;
    z.string().uuid('El ID de la petición debe ser un UUID válido').parse(askId);

    const story = await storyService.getStoryByAsk(askId, req.user);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/stories/:id -> edita el texto y/o publica la historia
const updateStoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    z.string().uuid('El ID de la historia debe ser un UUID válido').parse(id);
    const validatedData = updateStorySchema.parse(req.body);

    const story = await storyService.updateStory(id, validatedData, req.user);

    res.status(200).json({
      success: true,
      message: 'Historia actualizada con éxito',
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateStoryController,
  getStoriesController,
  getStoryByAskController,
  updateStoryController,
};
