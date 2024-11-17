const Product = require('../models/productModel');


exports.getHomePage = (req, res) => {
  console.log("User info:", req.user); // הדפסה לבדוק אם יש מידע על המשתמש

  res.render('layouts/layout', { 
    title: 'Home Page', 
    body: '../pages/index',
    user: req.user || null // נשלח את המידע על המשתמש אם הוא קיים
  });
};

exports.getLoginPage = (req, res) => {
  res.render('layouts/layout', { 
    title: 'Login Page',
    body: '../pages/login',
    user: req.user || null, // נשלח את המידע על המשתמש אם הוא קיים
    errorMessage: null,
    successMessage: null
  });
};

exports.getRegisterPage = (req, res) => {
  res.render('layouts/layout', { 
    title: 'Registration', 
    body: '../pages/register',
    user: req.user || null, // נשלח את המידע על המשתמש אם הוא קיים
    errorMessage: null, 
    successMessage: null 
  });
};

exports.getDashboardPage = (req, res) => {
  const totalProducts = 50; // נתון סטטי לדוגמה
  const totalSales = 120; // נתון סטטי לדוגמה
  const revenue = 25000; // נתון סטטי לדוגמה

  res.render('layouts/layout', {
    title: 'Admin Dashboard',
    body: '../pages/dashboard',
    user: req.user || null, // נשלח את המידע על המשתמש אם הוא קיים
    totalProducts,
    totalSales,
    revenue
  });
};
exports.getProductsPage = async (req, res) => {
  try {
    const products = await Product.find(); // שליפת כל המוצרים מהמסד
    res.render('layouts/layout', { 
      title: 'Products Page',
      body: '../pages/products',
      products,
      user: req.user || null 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading the products page");
  }
};



exports.getCartPage = (req, res) => {
  res.render('layouts/layout', { 
    title: 'Cart Page', 

    body: '../pages/cart',
    user: req.user || null // נשלח את המידע על המשתמש אם הוא קיים
  });
};
exports.getShopPage = async (req, res) => {
  try {
      const products = await Product.find(); // שליפת כל המוצרים מבסיס הנתונים
      res.render('shop', { products });
  } catch (err) {
      console.error(err);
      res.status(500).send("Error loading the shop page");
  }
};
exports.logout = (req, res) => {
  res.clearCookie('accessToken'); // ניקוי הטוקן מהעוגיה
  res.clearCookie('refreshToken'); // ניקוי טוקן הרענון מהעוגיה, אם קיים
  res.redirect('/login'); // הפניית המשתמש לעמוד ההתחברות
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/"); // במקרה של שגיאה, נחזור לדף הבית
    }
    res.redirect("/login"); // הפניה לדף ההתחברות לאחר התנתקות מוצלחת
  });
};