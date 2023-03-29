const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const Admin = require('../models/adminModel');
const bannedUser = require ('../models/bannedUsersModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Admin Login
exports.Login = async (req,res, next) => {
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

        req.body.AdminData = {adminInfo: Login, token: token};
        req.body.duration = 'all time';
        
        next();

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

exports.Home = async (req,res) => {
    try{
        // Earnings, Products Sold, Number of registered users, Active users maybe (active attribute true on login and false on logout)
        let filter, filterProductQuantity;

        // All time, 7 days, 30 days, 3 months

        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

        if (req.body.duration == 'all time'){
            filter =  {$match: {sold: 'true'}};
            filterProductQuantity = {sold: 'true'}
        }
        else if (req.body.duration == '7 days'){
            filter = {$match: {sold: 'true', endTime: {$gte: sevenDaysAgo}}};
            filterProductQuantity = {sold: 'true', endTime: {$gte: sevenDaysAgo}}
        }
        else if (req.body.duration == '30 days'){
            filter = {$match: {sold: 'true', endTime: {$gte: thirtyDaysAgo}}};
            filterProductQuantity = {sold: 'true', endTime: {$gte: thirtyDaysAgo}}
        }
        else if(req.body.duration == '3 months'){
            filter = {$match: {sold: 'true', endTime: {$gte: threeMonthsAgo}}};
            filterProductQuantity = {sold: 'true', endTime: {$gte: threeMonthsAgo}}
        }

        let FinalData = {} ;
        
        // Since this function is being used in 2 routes, that's why we have added the check here
        if (req.body.AdminData){
            FinalData = req.body.AdminData;
        }

        // Earnings
        const query = Product.aggregate([
                filter,
                {
                    $group: {
                        _id: null,
                        totalCost: {$sum: "$cost"}
                    }
                }
          ])
        const productCost = await query;
        
        // Number of Products Sold over the platform
        const querySecond = Product.countDocuments(filterProductQuantity);
        const productQuantity = await querySecond;
        
        // Number of Active Users
        const queryThird = User.countDocuments({active: true});
        const ActiveUsers = await queryThird;

        // Number of Total Users
        const queryFourth = User.countDocuments();
        const NumberOfUsers = await queryFourth;

        let EarningsAndSales = {income: (productCost[0].totalCost)*0.05, productsSold: productQuantity, ActiveUsers: ActiveUsers, NumberOfUsers: NumberOfUsers};

        FinalData.sales = EarningsAndSales;

        res.status(200).json({status: 200, message: 'success', data: FinalData});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

exports.AllUsers = async (req, res) => {
    try{
        // Details of every user
        const query = User.find().select('-password');
        const userData = await query;

        res.status(200).json({status: 200, message: 'success', data: userData});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

exports.AllProducts = async (req,res) => {
    try{
        const query = Product.find();
        const productData = await query;

        res.status(200).json({status: 200, message: 'success', data: productData});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}