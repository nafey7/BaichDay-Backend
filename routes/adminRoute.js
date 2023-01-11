const express = require('express');
const controller = require('../controllers/adminController');

const router = express.Router();


// ADMIN-LOGIN
router
.route('/login')
.post(controller.Login);

// BAN USER FROM THE PLATFORM
router
.route('/banuser')
.post(controller.BanUser);

module.exports = router;
