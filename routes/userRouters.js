// userRouters.js
const express = require('express');
const passport = require('passport'); // נדרש עבור Google OAuth
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const registerValidation = require('../validations/registerValidation');
const loginValidation = require('../validations/loginValidation');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] })); // התחברות עם Google

router.post('/google', authController.googleLogin); // מסלול התחברות עם Google

router.post('/send-otp', registerValidation, authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/refresh-token', authController.refreshToken);
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);

router.delete('/:id', userController.deleteUser);
router.put('/:id', userController.updateUser);

module.exports = router;
