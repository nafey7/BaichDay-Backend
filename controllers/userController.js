const nodemailer = require("nodemailer");
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Product = require ('../models/productModel');

// User Signup
exports.Signup = async (req,res) => {
    try{
        if(!req.body.emailAddress || !req.body.password){
            throw new Error ('Please enter an email or password');
        }
        
        const query = User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512')
        })
        const Signup = await query;

        res.status(200).json({status: 201, message: 'success', data: Signup});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// User Login
exports.Login = async (req,res) => {
    try{

        if (!req.body.emailAddress || !req.body.password){
            throw new Error('Email or Password is not entered');
        }

        const query = User.findOne({
            emailAddress: req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512')
        });
        const FindUser = await query;
        const token = jwt.sign({id: FindUser._id}, 'baichday-secret');

        if (FindUser == null){
            throw new Error('Email or Password is wrong');
        }

        res.status(200).json({status: 200, message: 'success', token: token, data: FindUser});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// Add a product (Role: Seller)

exports.AddProduct = async (req,res) => {
    try{
        const query = Product.create({
            name: req.body.name,
            cost: req.body.cost,
            image: req.body.image,
            description: req.body.description,
            sold: false
        });
        const productAdded = await query;

        res.status(201).json({status: 201, message: 'success', data: productAdded});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}


// Bid on a product (Role: Bidder)

exports.BidOnProduct = async (req,res) => {
    try{

        // in future same banda 2 dafa bid kare to eliminate the one before wala bid
        const filter = {_id: req.body.productID};
        const bidObject = {userID: req.body.userID, bidCost: req.body.bidCost}
        const update = {$push: {bid: bidObject}};


        const query = Product.updateOne(filter, update, {new: true, runValidators: true});
        const bidOnProduct = await query;

        res.status(200).json({status: 200, message: 'success', data: bidOnProduct});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}