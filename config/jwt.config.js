const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const JWT_ACCESS_EXPIRATION = '15m';  // תוקף טוקן גישה - 15 דקות
const JWT_REFRESH_EXPIRATION = '7d';   // תוקף טוקן רענון - שבוע

// backend/models/refreshToken.model.js
const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: Date,
  isRevoked: {
    type: Boolean,
    default: false
  }
});