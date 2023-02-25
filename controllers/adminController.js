const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const Admin = require('../models/adminModel');
const bannedUser = require ('../models/bannedUsersModel');

// Admin Login
exports.Login = async (req,res) => {
    try{

        // Find query which will return entity from database with provided credentials (email address and password)
        const query = Admin.findOne({
            emailAddress : req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512')
        })
        const Login = await query;

        // Returns an error if login credentials are wrong
        if (Login == null){
            throw new Error('Email or Password is wrong');
        }

        // Creates a token and send it to front-end in response for authentication of Admin on each route access
        const token = jwt.sign({id: Login._id}, 'baichday-secret');
        

        res.status(200).json({status: 200, message: 'success', token: token, data: Login});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// Admin bans the USER (Bidder or Seller)
exports.BanUser = async (req,res) => {
    try{

        // Adding credentials (email address, phone number and home address) of user to the database of Banned users. User with these credentials will not be permitted on the auction platform for registration/Signup
        
        const query = bannedUser.create({
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address
        });

        const banUser = await query;

        res.status(201).json({status: 201, message: 'success', data: banUser});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});s
    }
}

// Model.find({updatedAt : { $gte : new Date(2014, 4, 24)} }, function(err, docs){
//     console.log(docs);
// });