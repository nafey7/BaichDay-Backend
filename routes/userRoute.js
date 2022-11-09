const express = require('express');
const controller = require('../controllers/userController');

// Login and Signup
const router = express.Router();


// USER-SIGNUP
router
.route('/signup')
.post(controller.Signup);

// USER-LOGIN
router
.route('/login')
.post(controller.Login);

// USER (SELLER) ADDS PRODUCT
router
.route('/addproduct')
.post(controller.AddProduct);

// USER (BIDDER) BIDS ON A PRODUCT
router
.route('/bidonproduct')
.post(controller.BidOnProduct);

module.exports = router;
