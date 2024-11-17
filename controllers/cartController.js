const CryptoJS = require('crypto-js');

// פונקציה להצפנה
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
}

// פונקציה לפענוח
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// פונקציה להוספת מוצר לעגלה
exports.addToCart = (req, res) => {
  try {
    const { productId } = req.body;
    console.log(productId);

    let cart = [];
    if (req.cookies.cart) {
      try {
        // פענוח המידע מהעוגייה
        const decryptedCart = decryptData(req.cookies.cart);
        cart = JSON.parse(decryptedCart);
      } catch (error) {
        console.error("שגיאה בפענוח JSON:", error);
        cart = [];
      }
    }

    // בדיקה אם המוצר כבר קיים בעגלה
    if (!cart.includes(productId)) {
      cart.push(productId);
    }

    // הצפנה ושמירת העגלה בעוגייה
    const encryptedCart = encryptData(JSON.stringify(cart));
    res.cookie('cart', encryptedCart, { httpOnly: true, secure: true, sameSite: 'None', path: '/' });
    res.status(200).json({ success: true, cartItemCount: cart.length });
  } catch (error) {
    console.error("שגיאה בשרת:", error);
    res.status(500).json({ success: false, message: "שגיאה בהוספת המוצר לעגלה" });
  }
};

// פונקציה לשליפת מוצרים מהעגלה
exports.getCartItems = (req, res) => {
  try {
    const encryptedCart = req.cookies.cart;
    if (encryptedCart) {
      // פענוח העגלה המוצפנת
      const decryptedCart = decryptData(encryptedCart);
      const cart = JSON.parse(decryptedCart);
      res.status(200).json({ success: true, data: cart });
    } else {
      res.status(404).json({ success: false, message: "אין מוצרים בעגלה" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "שגיאה בשליפת המוצרים מהעגלה" });
  }
};
