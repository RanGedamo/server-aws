// server/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// יצירת טוקנים
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// הרשמה
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // בדיקה אם המשתמש קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered'      
      });
    }

    // יצירת משתמש חדש
    const user = new User({
      firstName,
      lastName,
      email,
      password, // הסיסמה תוצפן אוטומטית דרך middleware במודל
      isAdmin: false // ברירת מחדל
    });

    await user.save();

    // יצירת טוקנים
    const tokens = generateTokens(user._id);

    // שמירת refresh token בדאטהבייס
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // שליחת refresh token בקוקי
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // שליחת תשובה למשתמש
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      },
      accessToken: tokens.accessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'שגיאה בהרשמה',
      error: error.message
    });
  }
};

// התחברות
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // בדיקת קיום המשתמש
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // בדיקת סיסמה
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // יצירת טוקנים
    const tokens = generateTokens(user._id);

    // שמירת refresh token בדאטהבייס
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // שליחת refresh token בקוקי
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      status: 'success',
      message: 'התחברת בהצלחה',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      },
      accessToken: tokens.accessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'שגיאה בהתחברות',
      error: error.message
    });
  }
};

// התנתקות
exports.logout = async (req, res) => {
  console.log(req.user.id);
  
  try {
    // מחיקת refresh token מהדאטהבייס
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      path: '/'
    });
    
    res.json({
      status: 'success',
      message: 'התנתקת בהצלחה'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'שגיאה בהתנתקות',
      error: error.message
    });
  }
};

// קבלת פרטי המשתמש המחובר
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'משתמש לא נמצא'
      });
    }

    res.json({
      status: 'success',
      user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'שגיאה בקבלת פרטי משתמש',
      error: error.message
    });
  }
};

// עדכון פרטי משתמש
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'משתמש לא נמצא'
      });
    }

    // אם מעדכנים סיסמה
    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'סיסמה נוכחית שגויה'
        });
      }
      user.password = newPassword;
    }

    // עדכון שאר הפרטים
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email && email !== user.email) {
      // בדיקה אם האימייל החדש כבר קיים
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'אימייל זה כבר קיים במערכת'
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      status: 'success',
      message: 'פרטי המשתמש עודכנו בהצלחה',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'שגיאה בעדכון פרטי משתמש',
      error: error.message
    });
  }
};

// רענון טוקן
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'לא נמצא טוקן רענון'
      });
    }

    // בדיקת תקינות הטוקן
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'טוקן לא תקין'
      });
    }

    // יצירת טוקנים חדשים
    const tokens = generateTokens(user._id);

    // עדכון refresh token בדאטהבייס
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // שליחת refresh token חדש בקוקי
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      status: 'success',
      accessToken: tokens.accessToken
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'טוקן לא תקין'
    });
  }
};