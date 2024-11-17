const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// פעולות זמינות למשתמשים רגילים
router.get('/filter', productController.filterProducts);

// פעולות ניהול מוצרים (Admin בלבד)
router.get('/average-price-by-screen', protect, adminOnly, productController.getAveragePriceByScreenType);
router.post('/create', protect, adminOnly, productController.createProduct);
router.delete('/delete/:id', protect, adminOnly, productController.deleteProduct);
router.put('/update/:id', protect, adminOnly, productController.updateProduct);
// router.get('/data', productController.getAllProductsData);
module.exports = router;
