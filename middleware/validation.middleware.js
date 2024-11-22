// server/middleware/validation.middleware.js
const { validationResult, check } = require('express-validator');
const User = require('../models/user.model');

// פונקציית עזר לבדיקת תוצאות הוולידציה
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'שגיאת וולידציה',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// וולידציה להרשמה
exports.validateRegister = [
  check('firstName')
    .trim()
    .notEmpty().withMessage('שם פרטי הוא שדה חובה')
    .isLength({ min: 2 }).withMessage('שם פרטי חייב להכיל לפחות 2 תווים')
    .matches(/^[A-Za-z\u0590-\u05FF\s]{2,}$/).withMessage('שם פרטי יכול להכיל רק אותיות'),
  
  check('lastName')
    .trim()
    .notEmpty().withMessage('שם משפחה הוא שדה חובה')
    .isLength({ min: 2 }).withMessage('שם משפחה חייב להכיל לפחות 2 תווים')
    .matches(/^[A-Za-z\u0590-\u05FF\s]{2,}$/).withMessage('שם משפחה יכול להכיל רק אותיות'),
  
  check('email')
    .trim()
    .notEmpty().withMessage('אימייל הוא שדה חובה')
    .isEmail().withMessage('כתובת אימייל לא תקינה')
    .normalizeEmail(),
  
  check('password')
    .notEmpty().withMessage('סיסמה היא שדה חובה')
    .isLength({ min: 8 }).withMessage('סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד'),
  
  validateRequest
];

// וולידציה להתחברות
exports.validateLogin = [
  // בדיקת אימייל
  check('email')
    .trim()
    .notEmpty()
    .withMessage('אימייל הוא שדה חובה')
    .isEmail()
    .withMessage('כתובת אימייל לא תקינה')
    .normalizeEmail(),

  // בדיקת סיסמה
  check('password')
    .notEmpty()
    .withMessage('סיסמה היא שדה חובה'),

  validateRequest
];

// וולידציה לעדכון פרטי משתמש
exports.validateUpdateUser = [
  // בדיקת שם פרטי אם נשלח
  check('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('שם פרטי חייב להכיל לפחות 2 תווים')
    .matches(/^[A-Za-z\u0590-\u05FF\s]{2,}$/)
    .withMessage('שם פרטי יכול להכיל רק אותיות בעברית או באנגלית'),

  // בדיקת שם משפחה אם נשלח
  check('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('שם משפחה חייב להכיל לפחות 2 תווים')
    .matches(/^[A-Za-z\u0590-\u05FF\s]{2,}$/)
    .withMessage('שם משפחה יכול להכיל רק אותיות בעברית או באנגלית'),

  // בדיקת סיסמה אם נשלחה
  check('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד'),

  validateRequest
];

// וולידציה לאיפוס סיסמה
exports.validateResetPassword = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('אימייל הוא שדה חובה')
    .isEmail()
    .withMessage('כתובת אימייל לא תקינה')
    .normalizeEmail(),
    
  validateRequest
];

// וולידציה לשינוי סיסמה
exports.validateChangePassword = [
  check('currentPassword')
    .notEmpty()
    .withMessage('סיסמה נוכחית היא שדה חובה'),

  check('newPassword')
    .notEmpty()
    .withMessage('סיסמה חדשה היא שדה חובה')
    .isLength({ min: 8 })
    .withMessage('סיסמה חייבת להכיל לפחות 8 תווים')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('הסיסמה חייבת להכיל אות גדולה, אות קטנה, מספר ותו מיוחד')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית');
      }
      return true;
    }),

  validateRequest
];