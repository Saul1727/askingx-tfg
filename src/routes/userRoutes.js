const express = require('express');
const { createAdminController } = require('../controllers/userController');

const router = express.Router();

// POST /api/users/admin
router.post('/admin', createAdminController);

module.exports = router;