const express = require('express');
const { 
    createAdminController, 
    createAskAuthorController, 
    registerUserController, 
    loginUserController, 
    getGiversController,
    getAllUsersController,
    updateUserController,
    updateUserProfileController,
    changePasswordController,
    resetPasswordController
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// GET /api/users/ -> Protegido para que solo los ADMIN puedan ver todos los usuarios
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    getAllUsersController
);

// PATCH /api/users/profile -> Protegido para cualquier usuario logueado
router.patch(
    '/profile',
    authMiddleware,
    updateUserProfileController
);

// PATCH /api/users/password -> Protegido para cualquier usuario logueado
router.patch(
    '/password',
    authMiddleware,
    changePasswordController
);

// PATCH /api/users/:id/reset-password -> Protegido para que solo ADMIN pueda resetear
router.patch(
    '/:id/reset-password',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    resetPasswordController
);

// PATCH /api/users/:id -> Protegido para que solo los ADMIN puedan actualizar usuarios
router.patch(
    '/:id',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    updateUserController
);

// POST /api/users/admin
router.post('/admin', createAdminController);

// POST /api/users/author
router.post('/author', createAskAuthorController);

// POST /api/users/register
router.post('/register', registerUserController);

// POST /api/users/login
router.post('/login', loginUserController);

// GET /api/users/givers -> ver la lista de voluntarios
router.get('/givers', getGiversController);

module.exports = router;