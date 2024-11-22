// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { 
  validateRegister, 
  validateLogin 
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes (דורשות התחברות)
router.get('/me', protect, authController.getCurrentUser);
router.post('/logout', protect, authController.logout);
router.put('/update-profile', protect, authController.updateProfile);

module.exports = router;