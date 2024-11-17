const jwt = require('jsonwebtoken');


exports.optionalAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("Access Token:", token);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded user information:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    req.user = null;
  }

  next();
};


exports.protect = (req, res, next) => {
  // console.log("Cookies:", req.cookies); // הדפסה של כל העוגיות

  const token = req.cookies.accessToken; // בדיקה אם יש טוקן בעוגיה
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // הדפסת המידע שפוענח מהטוקן
    req.user = decoded; // שמירה של המידע על המשתמש
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};
