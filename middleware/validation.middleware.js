// src/middleware/auth.middleware.js

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Email validation
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter a valid email address'
    });
  }

  if (email.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Email must be less than 50 characters'
    });
  }

  // Password validation
  if (!password) {
    return res.status(400).json({
      status: 'error',
      message: 'Password is required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long'
    });
  }

  if (password.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be less than 50 characters'
    });
  }

  next();
};

exports.validateRegister = (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // First Name validation
  if (!firstName) {
    return res.status(400).json({
      status: 'error',
      message: 'First name is required'
    });
  }

  if (firstName.length < 2) {
    return res.status(400).json({
      status: 'error',
      message: 'First name must be at least 2 characters long'
    });
  }

  if (firstName.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'First name must be less than 50 characters'
    });
  }

  if (!/^[a-zA-Z]+$/.test(firstName)) {
    return res.status(400).json({
      status: 'error',
      message: 'First name can only contain letters and spaces, and must be in English'
    });
  }

  // Last Name validation
  if (!lastName) {
    return res.status(400).json({
      status: 'error',
      message: 'Last name is required'
    });
  }

  if (lastName.length < 2) {
    return res.status(400).json({
      status: 'error',
      message: 'Last name must be at least 2 characters long'
    });
  }

  if (lastName.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Last name must be less than 50 characters'
    });
  }

  if (!/^[a-zA-Z]+$/.test(lastName)) {
    return res.status(400).json({
      status: 'error',
      message: 'Last name can only contain letters and spaces, and must be in English'
    });
  }

  // Email validation
  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter a valid email address'
    });
  }

  if (email.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Email must be less than 50 characters'
    });
  }

  // Password validation
  if (!password) {
    return res.status(400).json({
      status: 'error',
      message: 'Password is required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long'
    });
  }

  if (password.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be less than 50 characters'
    });
  }

  // Complex password validation
  const passwordChecks = {
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  if (!(passwordChecks.hasUpper && passwordChecks.hasLower)) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must contain both uppercase and lowercase letters'
    });
  }

  if (!passwordChecks.hasNumber) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must contain at least one number'
    });
  }

  if (!passwordChecks.hasSpecial) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must contain at least one special character'
    });
  }

  // Confirm Password validation
  if (!confirmPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Please confirm your password'
    });
  }

  if (confirmPassword !== password) {
    return res.status(400).json({
      status: 'error',
      message: 'Passwords do not match'
    });
  }

  next();
};