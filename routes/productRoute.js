const express = require('express');
const controller = require('../controllers/productController');

const router = express.Router();


// View Product
router
.route('/')
.get(controller.ViewProducts);

// Search Product
router
.route('/search').post(controller.SearchProduct);

// View Single Product
router
.route('/single')
.post(controller.ViewSingleProduct)

module.exports = router;
