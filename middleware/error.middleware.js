// server/middleware/error.middleware.js
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'שגיאת וולידציה',
        errors: Object.values(err.errors).map(error => ({
          field: error.path,
          message: error.message
        }))
      });
    }
  
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'משתמש עם אימייל זה כבר קיים במערכת'
      });
    }
  
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'שגיאת שרת'
    });
  };