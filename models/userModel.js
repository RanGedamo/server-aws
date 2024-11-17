const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: function() { return !this.isGoogleUser; }, // נדרש רק אם המשתמש אינו מ-Google
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return !this.isGoogleUser; }, // נדרש רק אם המשתמש אינו מ-Google
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isGoogleUser: { // שדה חדש שמציין אם המשתמש התחבר באמצעות Google
    type: Boolean,
    default: false,
  },
});

// הצפנת סיסמה לפני שמירת משתמש חדש, רק אם מדובר במשתמש רגיל
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isGoogleUser) { // דילוג על הצפנה אם המשתמש מ-Google
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
