const express = require('express');
const router = express.Router();
const { register, login, deleteUser, updateUser } = require('../controllers/authController');

// רישום משתמש
router.post('/register', register);

// התחברות
router.post('/login', login);

// מחיקת משתמש
router.delete('/delete/:id', deleteUser);

// עדכון משתמש
router.put('/update/:id', updateUser);

module.exports = router;
