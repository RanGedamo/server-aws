// server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'אנא התחבר כדי לגשת לעמוד זה' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'משתמש לא נמצא' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'טוקן לא תקין, אנא התחבר מחדש' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'גישה למנהלים בלבד' });
  }
  next();
};
