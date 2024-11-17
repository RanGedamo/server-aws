// authController.js
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otpUtils');
const { sendVerificationEmail } = require('../utils/emailService');
const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken, setTokens } = require('../utils/tokenUtils');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library'); // קשור ל-Google

const otpStore = {};

// שליחת OTP
exports.sendOtp = async (req, res) => {
  const { username } = req.body;
  const otp = generateOtp();

  const trimmedUsername = username.trim();
  otpStore[trimmedUsername] = otp;
  console.log("Saving OTP for username:", trimmedUsername, "OTP:", otp);

  try {
    await sendVerificationEmail(trimmedUsername, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
};

// אימות OTP
exports.verifyOtp = (req, res) => {
  const { username, otp } = req.body;
  const trimmedUsername = username.trim();

  console.log("Verifying OTP for username:", trimmedUsername);
  console.log("Stored OTP:", otpStore[trimmedUsername]);

  if (otpStore[trimmedUsername] && otpStore[trimmedUsername] === otp.trim()) {
    delete otpStore[trimmedUsername];
    res.status(200).json({ success: true, message: 'OTP verification successful' });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP code' });
  }
};

// חידוש טוקן גישה
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token not provided' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie('accessToken', newAccessToken, { // שים לב לתיקון כאן ל-`newAccessToken`
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 15 * 60 * 1000, // 15 דקות
    });
    res.status(200).json({ message: 'Token refreshed successfully' });
  });
};
// התחברות עם Google - פונקציה חדשה
exports.googleLogin = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    let user = await User.findOne({ username: email });
    if (!user) {
      user = new User({
        username: email,
        firstName: payload.given_name,
        lastName: payload.family_name || "N/A", // נשתמש ב-"N/A" אם `lastName` לא קיים
        isGoogleUser: true, // נוודא ש-`isGoogleUser` מוגדר כ-`true`
        password: "google_oauth", // נשתמש בערך דיפולטי כדי לעקוף את הבדיקה על שדה `password`
      });
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokens(res, accessToken, refreshToken);
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// authController.js
exports.googleCallback = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { idToken } = req.query; // ID token מהתשובה של Google

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // בדיקת קיום המשתמש לפי השדה username (שמייצג את כתובת ה-Email)
    let user = await User.findOne({ username: email });
    if (!user) {
      // יצירת משתמש חדש כאשר username הוא email
      user = new User({ username: email, firstName: payload.given_name, lastName: payload.family_name });
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setTokens(res, accessToken, refreshToken);
    res.redirect('/'); // חזרה לדף הבית או לנתיב המיועד לאחר התחברות מוצלחת
  } catch (error) {
    console.error('Error during Google callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
