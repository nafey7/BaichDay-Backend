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
            password: req.body.password
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

        const query = User.findOne({_id: req.body.userID});
        const UserInfo = await query;

        const banQuery = bannedUser.create({
        emailAddress: UserInfo.emailAddress,
        phoneNumber: UserInfo.phoneNumber,
        address: UserInfo.address
        });

        const banUser = await banQuery;

        res.status(201).json({status: 201, message: 'success', data: banUser});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});s
    }
}

exports.Home = async (req,res) => {
    try{

        // Later to use for revenue generation and items sold, both by categories
        let itemsByCategory = {Collectibles:0, Sporting:0, Electronics:0, Fashion:0, Toys:0, Music:0, Cars:0, Other:0};
        let revenueByCategory = {Collectibles:0, Sporting:0, Electronics:0, Fashion:0, Toys:0, Music:0, Cars:0, Other:0};
        let totalProducts = 0;
        let totalAmount = 0;

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


        const ProductsByCategory = await Product.find({ sold: 'true' }).select('-image');
        ProductsByCategory.forEach(async (product) => {
            if (product.category){
                
                totalProducts += 1;
                totalAmount += product.cost;

                if (product.category == 'Collectibles'){
                    itemsByCategory.Collectibles += 1;
                    revenueByCategory.Collectibles += product.cost;
                }
                else if (product.category == 'Sporting'){
                    itemsByCategory.Sporting += 1;
                    revenueByCategory.Sporting += product.cost;
                }
                else if (product.category == 'Electronics'){
                    itemsByCategory.Electronics += 1;
                    revenueByCategory.Electronics += product.cost;
                }
                else if (product.category == 'Fashion'){
                    itemsByCategory.Fashion += 1;
                    revenueByCategory.Fashion += product.cost;
                }
                else if (product.category == 'Toys'){
                    itemsByCategory.Toys += 1;
                    revenueByCategory.Toys += product.cost;
                }
                else if (product.category == 'Music'){
                    itemsByCategory.Music += 1;
                    revenueByCategory.Music += product.cost;
                }
                else if (product.category == 'Cars'){
                    itemsByCategory.Cars += 1;
                    revenueByCategory.Cars += product.cost;
                }
                else if (product.category == 'Other'){
                    itemsByCategory.Other += 1;
                    revenueByCategory.Other += product.cost;
                }
            }
          });

        Object.entries(itemsByCategory).forEach(([key, value]) => {
            itemsByCategory[key] = Math.round(((value/totalProducts)*100));
          });
        Object.entries(revenueByCategory).forEach(([key, value]) => {
            revenueByCategory[key] = Math.round(((value/totalAmount)*100));
        });

        let labelsArray = [];
        let revenueByCategoryArray = [];
        let itemsByCategoryArray = [];
        Object.entries(itemsByCategory).forEach(([key, value]) => {
          labelsArray.push(key);
          itemsByCategoryArray.push(value);
        });
        Object.entries(revenueByCategory).forEach(([key, value]) => {
            revenueByCategoryArray.push(value);
        });

        FinalData.labels = labelsArray;
        FinalData.itemsByCategory = itemsByCategoryArray;
        FinalData.revenueByCategory = revenueByCategoryArray;

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

exports.AllBanned = async (req, res) => {
    try{
        // Details of every user
        const query = bannedUser.find();
        const bannedUserData = await query;

        res.status(200).json({status: 200, message: 'success', data: bannedUserData});
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

exports.UserNames = async (req,res) => {
    try{
        const query = User.findOne({_id: req.body.userID});
        const userName = await query;

        let name = userName.firstName + ' ' + userName.lastName;
        res.status(200).json({status: 200, message: 'success', data: name});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}