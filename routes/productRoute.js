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

module.exports = router;
