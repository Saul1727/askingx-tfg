const express = require('express');
const { createAdminController, createAskAuthorController } = require('../controllers/userController');

const router = express.Router();

// POST /api/users/admin
router.post('/admin', createAdminController);

// POST /api/users/author
router.post('/author', createAskAuthorController);

module.exports = router;