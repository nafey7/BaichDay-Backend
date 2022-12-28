const nodemailer = require("nodemailer");
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Product = require ('../models/productModel');
const Helper = require ('../controllers/helperController');
// const { updateOne } = require("../models/userModel");

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
        let arr = [{userID: "0",bidCost: 0}]
        const query = Product.create({
            name: req.body.name,
            cost: req.body.cost,
            image: req.body.image,
            description: req.body.description,
            sold: false,
            bid: arr
        });
        const productAdded = await query;

        // const querySecond = updateOne({name: })

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

// View Product that I have currently bid on
exports.ViewCurrentBidProducts = async (req,res) => {
    try{
        const query = Product.find({sold: false}).elemMatch("bid", {userID: req.body.userID}).select('-image');
        const viewProducts = await query;

        res.status(200).json({status: 200, message: 'success', data: viewProducts});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// View All Products I have bid on
exports.ViewAllBidProducts = async (req,res) => {
    try{
        const query = Product.find().elemMatch("bid", {userID: req.body.userID}).select('-image');
        const viewProducts = await query;

        res.status(200).json({status: 200, message: 'success', data: viewProducts});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// Give Rating to a SELLER
exports.SubmitReviewToSeller = async (req,res) => {
    try{

        // Creating object for adding to review array

        let finalObject = {};
        finalObject.review = req.body.review;
        finalObject.rating = req.body.rating;
        finalObject.bidderID = req.body.userID;
        finalObject.date = req.body.timeApi;

        const filter = {_id: req.body.sellerID};
        const update = {$push: {reviewAsSeller: finalObject, ratingArrayAsSeller: req.body.rating}};
        
        const query = User.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        const submitReview = await query;

        // Calculate Rating
        const rating = Helper.CalculateRating(submitReview.ratingArrayAsSeller);

        // Store rating in User DB
        const querySecond = User.findOneAndUpdate(filter, {ratingAsSeller: rating}, {new: true, runValidators: true});
        const updateRating = await querySecond;

        res.status(201).json({status: 201, message: 'success', data: updateRating});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}


// Give Rating to a BIDDER
exports.SubmitReviewToBidder = async (req,res) => {
    try{

        // Creating object for adding to review array

        let finalObject = {};
        finalObject.review = req.body.review;
        finalObject.rating = req.body.rating;
        finalObject.sellerID = req.body.userID;
        finalObject.date = req.body.timeApi;

        const filter = {_id: req.body.bidderID};
        const update = {$push: {reviewAsBidder: finalObject, ratingArrayAsBidder: req.body.rating}};
        
        // Insert review and rating in respective arrays
        const query = User.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        const submitReview = await query;

        // Calculate rating
        const rating = Helper.CalculateRating(submitReview.ratingArrayAsBidder);

        // Store rating in User DB
        const querySecond = User.findOneAndUpdate(filter, {ratingAsBidder: rating}, {new: true, runValidators: true});
        const updateRating = await querySecond;

        res.status(201).json({status: 201, message: 'success', data: updateRating});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}