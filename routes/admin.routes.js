// server/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.use(protect, adminOnly);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
