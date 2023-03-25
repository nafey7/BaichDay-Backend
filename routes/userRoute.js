const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();


// USER-SIGNUP
router
.route('/signup')
.post(controller.Signup);

// USER-LOGIN
router
.route('/login')
.post(controller.Login);

// VIEW USER PROFILE
router
.route('/viewprofile')
.post(controller.ViewProfile)

// EDIT USER PROFILE
router
.route('/editprofile')
.post(controller.EditProfile)

// USER (SELLER) ADDS PRODUCT
router
.route('/addproduct')
.post(controller.AddProduct);

// USER (BIDDER) BIDS ON A PRODUCT
router
.route('/bidonproduct')
.post(controller.BidOnProduct);

// USER CAN VIEW PRODUCTS THEY HAVE CURRENTLY BID ON
router
.route('/viewcurrentbidproducts')
.post(controller.ViewCurrentBidProducts);

// USER CAN VIEW ALL PRODUCTS THEY HAVE BID ON
router
.route('/viewallbidproducts')
.post(controller.ViewAllBidProducts);

// SUBMIT A REVIEW TO SELLER
router
.route('/submitreviewtoseller')
.post(controller.SubmitReviewToSeller);

// SUBMIT A REVIEW TO BIDDER
router
.route('/submitreviewtobidder')
.post(controller.SubmitReviewToBidder);

// CHARGE USER'S WALLET
router
.route('/chargewallet')
.post(controller.ChargeWallet);

// USER LOGOUT
router
.route('/logout')
.post(controller.Logout);

// GET WALLET INFORMATION OF A USER
router
.route('/wallet')
.post(controller.GetWallet);

// GET LIST OF USERS THAT A USER CAN CHAT WITH
router
.route('/chatlist')
.post(controller.ChatList);

// GET USER CHAT
router
.route('/chat')
.post(controller.UserChat)


module.exports = router;
