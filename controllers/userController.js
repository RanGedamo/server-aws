const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, setTokens } = require('../utils/tokenUtils');

// רישום משתמש חדש
exports.register = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      username,
      password,
    });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokens(res, accessToken, refreshToken);

    res.status(201).json({ success: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

// התחברות משתמש
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokens(res, accessToken, refreshToken);

    res.status(200).json({ success: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

// מחיקת משתמש לפי ID (Admin בלבד)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, isAdmin, password } = req.body;
    const updateData = { username, email, isAdmin };

    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &), and be at least 8 characters long.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
