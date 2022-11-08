const express = require('express');
const controller = require('../controllers/userController');

// Login and Signup
const router = express.Router();


// USER-SIGNUP
router.route('/signup').post(controller.Signup);

// USER-LOGIN
router.route('/login').post(controller.Login);

module.exports = router;
