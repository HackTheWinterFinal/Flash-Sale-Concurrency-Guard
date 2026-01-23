const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);

module.exports = router;
