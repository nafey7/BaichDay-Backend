const Product = require('../models/productModel');
const helperController = require('../controllers/helperController');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');


exports.ViewProducts = async (req,res) => {
    try{
        // This function returns products and their information in response which users can bid on.

        const query = Product.find({
            sold: 'false'
        })
        const ViewProducts = await query;

        res.status(200).json({status: 200, message: 'success', data: ViewProducts})
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.msg});
    }
}

exports.ViewProductsByCategory = async (req,res) => {
    try{
        // This function returns products by categories and their information in response which users can bid on.

        const filter = {sold: 'false', category: req.body.category}
        const query = Product.find(filter);
        const ViewProducts = await query;

        res.status(200).json({status: 200, message: 'success', data: ViewProducts})
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.msg});
    }
}

exports.SearchProduct = async (req,res) => {
    try{
        // This function is used to search for the products by their names

        const query = Product.find({
            name: {$regex: req.body.name, $options : 'i'}
        });
        const searchProduct = await query;

        res.status(200).json({status: 200, message: 'success', data: searchProduct});
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message})
    }
}

exports.ViewSingleProduct = async (req,res, next) => {
    try{

        // This function returns the time remaining (in seconds) of a product which is selected by user on the Front-End side of the application
        
        let filter = {_id: req.body.productID};
        // let update = {sold: 'true'};

        // Extract specific product from Database which the user selects
        const query = Product.findOne(filter);
        const findProduct = await query;

        // Calculate current time
        const now = new Date();
        const timestamp = now.getTime();
        const nowDate = new Date(timestamp);
        
        // Find the difference between current time and end time (in milliseconds) of the bid on a partocular product. The difference will tell whether the auction is over for the product
        const diffTime = findProduct.endTime - nowDate;

        // Time difference is converted from miliseconds to seconds
        let timeRemaining = Math.ceil(diffTime / (1000));

        if (timeRemaining <= 0){
            timeRemaining = 0;
        }

        req.body.timeRemaining = timeRemaining;
        req.body.productDetails = findProduct;

        next();

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message})
    }
}


exports.HighestBidder = async(req,res, next) => {
    try{
        let biddingArray = req.body.productDetails.bid;
        let maxBid = {userID: '0', bidCost: 0};

        // check for whether there is a bid on the product
        if (biddingArray.length > 1){
            for (let i=0;i<biddingArray.length;i++){
                if (biddingArray[i].bidCost > maxBid.bidCost){
                    maxBid.userID = biddingArray[i].userID;
                    maxBid.bidCost = biddingArray[i].bidCost;
                }
            }
        }

        // Wallet transactions for the product occurs when there is a highest bidder and the auciton is over
        if (req.body.timeRemaining == 0 && biddingArray.length > 1){
            req.body.maxBid = maxBid;
            next();
        }
        else if (req.body.timeRemaining == 0 && biddingArray.length == 1){
            const queryDeleteProduct = Product.deleteOne({_id: req.body.productID});
            const DeleteProduct = await queryDeleteProduct;

            res.status(200).json({status: 200, message: 'success', data: 'The product is expired'});
        }
        else{
            res.status(200).json({status: 200, message: 'success', data: req.body.timeRemaining, highestBidder: maxBid});
        }
        
    }
    catch(err){
        console.log(err);   
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}


exports.BuyProduct = async (req,res) => {
    try{
        let updates = [];

        let filter = {_id: req.body.productID};
        let update = {sold: 'true'};

        // If the time for bidding of a particular product is over, then update the sold status of the product from false to true
        const querySecond = Product.findOneAndUpdate(filter, update, {new: true, runValidators: true});
        const updateStatus = await querySecond;
        
        let productCost = req.body.maxBid.bidCost; 
        let biddingArray = req.body.productDetails.bid;
        let objectInUpdates, walletAmountUpdated;

        // Transfer the bid cost back to the users who have not won the auction bid
        for (let i=1;i<biddingArray.length;i++){
            objectInUpdates = {};
            if (biddingArray[i].userID == req.body.maxBid.userID){
                continue;
            }
            else{
                walletAmountUpdated = biddingArray[i].bidCost + biddingArray[i].walletAfterBid;
                objectInUpdates.updateOne = {filter: {_id: biddingArray[i].userID}, update: {wallet: walletAmountUpdated}};

                updates.push(objectInUpdates);
            }
        }

        // Bulk write is used to update multiple documents with different values on same product
        const updateWalletQuery = User.bulkWrite(updates);
        const walletUpdated = await updateWalletQuery;

        // calculate costs that will go to seller and admin
        let newAmountAdmin = Math.ceil(0.05*productCost);
        let newAmountSeller = Math.floor(0.95*productCost);

        // updating the admin's wallet
        const updateAdminquery = Admin.updateOne({_id: '636abe4f086b725042337410'}, {wallet: newAmountAdmin}, {new: true, runValidators: true});
        const AdminWallet = await updateAdminquery;

        // updating the seller's wallet
        let sellerID = req.body.productDetails.userID;
        const updateSellerQuery = User.updateOne({_id: sellerID}, {$inc: { wallet: newAmountSeller}}, {new: true, runValidators: true});
        const updateSellerWallet = await updateSellerQuery;
        
        res.status(200).json({status: 200, message: 'success', data: req.body.timeRemaining, highestBidder: req.body.maxBid});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}