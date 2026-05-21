const express = require('express');
const { createAdminController, createAskAuthorController, registerUserController, loginUserController, getGiversController } = require('../controllers/userController');
const { register } = require('node:module');

const router = express.Router();

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