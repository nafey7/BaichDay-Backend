const express = require('express');
const controller = require('../controllers/adminController');

const router = express.Router();


// ADMIN-LOGIN
router.route('/login').post(controller.Login);

module.exports = router;
