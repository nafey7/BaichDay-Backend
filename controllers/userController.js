const nodemailer = require("nodemailer");
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const User = require('../models/userModel');
const Product = require ('../models/productModel');
const BannedUser = require ('../models/bannedUsersModel');
const Helper = require ('../controllers/helperController');
const Notification = require('../models/notificationModel');
const Message = require('../models/messageModel');

// User Signup
exports.Signup = async (req,res) => {
    try{

        // Check: Whether user banned or not
        const banQuery = BannedUser.find().or([
            {emailAddress: req.body.emailAddress},
            {phoneNumber: req.body.phoneNumber},
            {address: req.body.address}]);
        const banCheck = await banQuery;
        
        // console.log(banCheck);
        if (banCheck.length != 0){
            throw new Error ('This user is banned from the platform');
        }
        
        // Check: Whether another user is registered with same email address or not
        const emailCheckQuery = User.find({emailAddress: req.body.emailAddress});
        const emailCheck = await emailCheckQuery;

        if (emailCheck.length != 0){
            throw new Error ('Account already exists with this email');
        }

        // If the previous checks are cleared, the user credentials along with other information are added to the User Database
        const query = User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512'),
            wallet: 0
        })
        let Signup = await query;

        const querySecond = Notification.create({
            userID: Signup._id,
            notify: true,
            notification: {content: 'Welcome to BaichDay! Charge your wallet and start bidding now!', date: req.body.dateApi, time: req.body.timeApi}
        })
        const NotificationExtract = await querySecond;
        
        res.status(200).json({status: 201, message: 'success', data: Signup, notification: NotificationExtract});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// User Login
exports.Login = async (req,res) => {
    try{

        // Give Error if Email or Password fields are empty
        if (!req.body.emailAddress || !req.body.password){
            throw new Error('Email or Password is not entered');
        }

        // Checking whether the user-provided credentials match with the one present in Database
        const query = User.findOne({
            emailAddress: req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512')
        });
        const FindUser = await query;
        const token = jwt.sign({id: FindUser._id}, 'baichday-secret');

        // Return an Error if Email or Password is wrong
        if (FindUser == null){
            throw new Error('Email or Password is wrong');
        }

        const querySecond = User.updateOne({_id: FindUser._id}, {active: true}, {new: true, runValidators: true});
        const ActiveStatus = await querySecond;

        res.status(200).json({status: 200, message: 'success', token: token, data: FindUser});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// View Profile of the User
exports.ViewProfile = async (req,res) => {
    try{
        // Query to return the details of the User in response
        const query = User.findOne({_id: req.body.userID});
        const viewProfile = await query;

        res.status(200).json({status: 200, message: 'success', data: viewProfile});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// Edit Profile of the User
exports.EditProfile = async(req,res) => {
    try{
        let update = {};
        const filter = {_id: req.body.userID};

        // Checking if the new Email Address is not in use already. If it is already in use, this will return an Error in the response
        if (req.body.emailAddress){
            const checkQuery = User.findOne({emailAddress: req.body.emailAddress});
            const checkEmail = await checkQuery;

            if (checkEmail == null){
                update.emailAddress = req.body.emailAddress;
            }
            else{
                throw new Error ('This email is already in use');
            }
        }

        if (req.body.firstName){
            update.firstName= req.body.firstName;
        }
        if (req.body.lastName){
            update.lastName = req.body.lastName;
        }
        if (req.body.phoneNumber){
            update.phoneNumber = req.body.phoneNumber;
        }
        if (req.body.address){
            update.address = req.body.address;
        }
        if (req.body.city){
            update.city = req.body.city;
        }
        if (req.body.country){
            update.country = req.body.country;
        }
        if (req.body.password){
            update.password = req.body.password;
        }

        // Query to update the provided details by the user
        const query = User.updateOne(filter, update, {new: true, runValidators: true});
        const updateInfo = await query;

        // Query to return the new/updated details of the user
        const querySecond = User.findOne({_id: req.body.userID});
        const userInfo = await querySecond;
        
        res.status(200).json({status: '200', message: 'success', data: userInfo});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: "fail", data: err.message});
    }
}

// Add a product (Role: Seller)
exports.AddProduct = async (req,res) => {
    try{

        // Calculate the time at which the auction for the product will end
        const now = new Date();
        const timestamp = now.getTime();
        const endTimestamp = timestamp + req.body.duration * 60 * 60 * 1000;
        const endTime = new Date(endTimestamp);

        let arr = [{userID: "0",bidCost: 0}]

        // Query to add the product with its details to the Database
        const query = Product.create({
            name: req.body.name,
            userID: req.body.userID,
            cost: req.body.cost,
            image: req.body.image,
            category: req.body.category,
            endTime :endTime,
            description: req.body.description,
            sold: 'false',
            bid: arr
        });
        let productAdded = await query;

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

        const queryUser = User.findById(req.body.userID);
        const UserFound = await queryUser;

        const queryProduct = Product.findById(req.body.productID);
        const ProductFound = await queryProduct;


        // check if the user has placed a bid before on the same product
        let biddingArray = ProductFound.bid;
        let loopCheck = false
        let matchedValueCounter = 0;
        let xoxo;
        let walletAfterBid;

        for (let i=0;i<biddingArray.length;i++){
            if (biddingArray[i].userID == req.body.userID){
                loopCheck = true;
                console.log(biddingArray[i]);
                matchedValueCounter = i;
                break;
            }
        }

        if (loopCheck == true){
            walletAfterBid = (biddingArray[matchedValueCounter].bidCost + UserFound.wallet)-(req.body.bidCost);
            biddingArray.splice(matchedValueCounter, 1);
        }

        else{
            walletAfterBid = UserFound.wallet - req.body.bidCost;
        }

        // throw new Error('Check lagaya hai to prevent middleware to function for a while');

        // Check if the bid cost is greater than the cost of the product
        if (ProductFound.cost > req.body.bidCost){
            throw new Error ('The bid amount should be greater than the original cost of the product');
        }

        // check if wallet of a user has enough money
        if (walletAfterBid < 0){
            throw new Error('Wallet does not have enough coins');
        }

        // create an object containing cost of the bid, id of the bidder and the amount left in the wallet
        const filter = {_id: req.body.productID};
        const bidObject = {userID: req.body.userID, bidCost: req.body.bidCost, walletAfterBid: walletAfterBid};
        biddingArray.push(bidObject)
        const update = {bid: biddingArray};
        // const update = {$push: {bid: bidObject}};

        // Add the Bid (containing the identity of the Bidder, Bid amount, and Amount in Bidder's wallet after the bid) to Bid array of the relevant product
        const query = Product.updateOne(filter, update, {new: true, runValidators: true});
        const bidOnProduct = await query;

        // Update the wallet of the User
        const queryWallet = User.updateOne({_id: req.body.userID},{wallet: walletAfterBid},{new: true, runValidators: true});
        const walletUpdate = await queryWallet;

        res.status(200).json({status: 200, message: 'success', data: bidOnProduct});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// View the Product that Bidder has currently bid on
exports.ViewCurrentBidProducts = async (req,res) => {
    try{
        // Query to find products user has bid on and that are still on auction
        const query = Product.find({sold: 'false'}).elemMatch("bid", {userID: req.body.userID});
        const viewProducts = await query;

        let finalData = Helper.EvaluateParticularBid(viewProducts, req);

        res.status(200).json({status: 200, message: 'success', data: finalData});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// View All Products that the user has bid on (in past and currently)
exports.ViewAllBidProducts = async (req,res) => {
    try{
        // Query to find products user has bid on whether they are currently on auction or not
        const query = Product.find().elemMatch("bid", {userID: req.body.userID});
        const viewProducts = await query;

        let finalData = Helper.EvaluateParticularBid(viewProducts, req);

        res.status(200).json({status: 200, message: 'success', data: finalData});
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
        finalObject.date = req.body.dateApi;

        let notificationObject = {};
        notificationObject.content = "You have been rated as a Seller";
        notificationObject.date = req.body.dateApi;
        notificationObject.time = req.body.timeApi;

        const filterNotification = {userID: req.body.sellerID}
        const filter = {_id: req.body.sellerID};
        const update = {$push: {reviewAsSeller: finalObject, ratingArrayAsSeller: req.body.rating}};
        
        // Insert review and rating in respective arrays
        const query = User.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        const submitReview = await query;

        // Calculate Rating
        const rating = Helper.CalculateRating(submitReview.ratingArrayAsSeller);

        // Store rating in User DB
        const querySecond = User.findOneAndUpdate(filter, {ratingAsSeller: rating}, {new: true, runValidators: true});
        const updateRating = await querySecond;

        // Generate a notification of rating to the Seller
        const queryThird = Notification.findOneAndUpdate(filterNotification, {$push:{notification: notificationObject}}, {new: true, runValidators: true});
        const updatedNotification = await queryThird;

        res.status(201).json({status: 201, message: 'success', data: updateRating, notification: updatedNotification});
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
        finalObject.date = req.body.dateApi;

        let notificationObject = {};
        notificationObject.content = "You have been rated as a Bidder";
        notificationObject.date = req.body.dateApi;
        notificationObject.time = req.body.timeApi;

        const filterNotification = {userID: req.body.bidderID}
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

        // Generate a notification of rating to the Bidder
        const queryThird = Notification.findOneAndUpdate(filterNotification, {$push:{notification: notificationObject}}, {new: true, runValidators: true});
        const updatedNotification = await queryThird;

        res.status(201).json({status: 201, message: 'success', data: updateRating, notification: updatedNotification});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

// User can charge their built-in wallet through their connected bank accounts
exports.ChargeWallet = async(req,res) => {
    try{
        let filter = {_id: req.body.userID};

        // Extract the old wallet amount
        const query = User.findOne(filter).select('wallet -_id');
        const WalletAmount = await query;

        // obtain the new amount
        let newAmount = WalletAmount.wallet + req.body.amount;
        let update = {wallet: newAmount};

        // update the amount in Database
        const querySecond = User.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        const UpdatedAmount = await querySecond;

        res.status(200).json({status: 200, message: 'success', data: UpdatedAmount});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

exports.Logout = async (req,res) => {
    try{
        let filter = {_id: req.body.userID};
        let update = {active: false};
        const query = User.updateOne(filter, update, {new: true, runValidators: true});
        const Logout = await query;

        res.status(200).json({status: 200, message: 'success'})
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message})
    }
}

exports.GetWallet = async(req,res) => {
    try{
        const query = User.findOne({_id: req.body.userID}).select('wallet -_id');
        const walletInfo = await query;

        res.status(200).json({status: 200, message: 'success', data: walletInfo});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message})
    }
}

exports.ChatList = async (req,res) => {
    try{

        // If the user is involved in successful bidding, find the relevant users who are connected as sellers or buyers to the user through the product
        const query = Product.find({
            sold: 'true',
            $or:[
                {userID: req.body.userID},
                {newOwner: req.body.userID}
            ]
        }).select('userID newOwner -_id');
        const productList = await query;

        // Store the possible contacts in an array
        let arr = [];
        for (let i=0;i<productList.length;i++){
            arr.push(productList[i].userID);
            arr.push(productList[i].newOwner);
        }

        // Remove the repitive elements form array
        arr = [...new Set(arr)];

        // Remove the user's ID
        arr = arr.filter(element => element !== req.body.userID);
        console.log(arr);
        // Find the users list that are present in the array
        const querySecond = User.find({ _id: { $in: arr } }).select('firstName lastName');
        const UsersList = await querySecond;

        res.status(200).json({status: 200, message: 'success', data: UsersList});


    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}

exports.UserChat = async(req,res) => {
    try{
        const query = Message.find({
            $or:[
                {senderID: req.body.userID, receiverID: req.body.receiverID},
                {senderID: req.body.receiverID, receiverID: req.body.userID}
            ]
        });
        const MessageList = await query;

        res.status(200).json({status: 200, message: 'success', data: MessageList});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}