const express = require('express');
const {
  generateStoryController,
  getStoriesController,
  getStoryByAskController,
  updateStoryController,
} = require('../controllers/storyController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de historias requieren estar autenticado.
router.use(authMiddleware);

// Listar historias visibles (el servicio filtra por rol). Cualquier rol logueado.
router.get('/', getStoriesController);

// Ver la historia de una petición concreta. El servicio comprueba permisos.
router.get('/by-ask/:askId', getStoryByAskController);

// Generar/regenerar historia: solo el AUTHOR dueño o el ADMIN (CU-05).
router.post('/generate/:askId', roleMiddleware(['AUTHOR', 'ADMIN']), generateStoryController);

// Editar texto / publicar: solo AUTHOR dueño o ADMIN.
router.patch('/:id', roleMiddleware(['AUTHOR', 'ADMIN']), updateStoryController);

module.exports = router;
