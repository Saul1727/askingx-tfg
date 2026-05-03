const express = require('express');
const { createAdminController, createAskAuthorController, registerUserController } = require('../controllers/userController');
const { register } = require('node:module');

const router = express.Router();

// POST /api/users/admin
router.post('/admin', createAdminController);

// POST /api/users/author
router.post('/author', createAskAuthorController);

// POST /api/users/register
router.post('/register', registerUserController);

module.exports = router;