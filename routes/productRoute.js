const express = require('express');
const controller = require('../controllers/productController');
const helperController = require('../controllers/helperController');

const router = express.Router();


// View Products
router
.route('/')
.get(controller.ViewProducts);

// View Products by Cateogies
router
.route('/category')
.post(controller.ViewProductsByCategory);

// Search Product
router
.route('/search').post(controller.SearchProduct);

// View Single Product
router
.route('/single')
.post(controller.ViewSingleProduct, controller.HighestBidder);

module.exports = router;
