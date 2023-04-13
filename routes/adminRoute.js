const express = require('express');
const controller = require('../controllers/adminController');

const router = express.Router();


// ADMIN-LOGIN
router
.route('/login')
.post(controller.Login, controller.Home);

// BAN USER FROM THE PLATFORM
router
.route('/banuser')
.post(controller.BanUser);

router
.route('/home')
.post(controller.Home)

// SENDING DETAILS OF ALL USERS
router
.route('/allusers')
.post(controller.AllUsers);

// SENDING DETAILS OF ALL BANNED USERS
router
.route('/allbannedusers')
.post(controller.AllBanned);

// SENDING DETAILS OF ALL PRODUCTS
router
.route('/allproducts')
.post(controller.AllProducts);

// SENDING NAME OF THE USER BY CATCHING ID
router
.route('/username')
.post(controller.UserNames);

module.exports = router;
