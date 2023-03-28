const User = require('../models/userModel');
const Product = require ('../models/productModel');
const BannedUser = require ('../models/bannedUsersModel');
const Admin = require('../models/adminModel');

exports.CalculateRating = (arr) => {

    // This function calculates the rating of the seller/bidder
    let sum=0;
    for (let i=0;i<arr.length;i++){
        sum = sum+arr[i];
    }
    let rating = (sum)/(arr.length);

    return rating;
}


exports.EvaluateParticularBid = (viewProducts, req) => {
    let finalData = [];

        let userBidArray, mockData;
        if (viewProducts.length > 0){
            let bidArray, bidArrayLength;
            for (let i=0;i<viewProducts.length;i++){

                userBidArray =[];
                mockData = {};

                mockData._id = viewProducts[i]._id;
                mockData.name = viewProducts[i].name;
                mockData.cost = viewProducts[i].cost;
                mockData.description = viewProducts[i].description;
                mockData.sold = viewProducts[i].sold;
                
                bidArray = viewProducts[i].bid
                bidArrayLength = bidArray.length;

                for (let j=0;j<bidArrayLength;j++){
                    if (bidArray[j].userID == req.body.userID){
                        userBidArray.push(bidArray[j].bidCost)
                    }
                }

                mockData.userBidArray = userBidArray;
                mockData.maxBid = Math.max.apply(Math, userBidArray);

                finalData.push (mockData);
            }
        }

        return finalData;
}

exports.AutoPayment = async (sup) =>{
    try{
        const activeProducts = await Product.find({ sold: 'false' });

        activeProducts.forEach(async (auction) => {
          // check the EndTime and Current time of each product
          const expiryTime = new Date(auction.endTime).getTime();
          const currentTime = new Date().getTime();
        //   console.log('Bid Array Length:', auction.bid.length);

          // If a product has reached its EndTime, the status of the each product will be changed from false to processing
          if ((currentTime > expiryTime) && (auction.bid.length > 1)) {
            console.log('Processing updated');
            let updateStatus = await Product.updateOne({ _id: auction._id }, { $set: { sold: 'processing' } });
          }
          else if ((currentTime > expiryTime) && (auction.bid.length === 1)) {
            console.log('Expiry updated');
            let updateStatus = await Product.updateOne({ _id: auction._id }, { $set: { sold: 'expired' } });
          }
        });

        const processedProducts = await Product.find({ sold: 'processing' });
        let updates = [];

        processedProducts.forEach(async (auction) => {
            
            let biddingArray = auction.bid;
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
        let updateStatus = await Product.findOneAndUpdate({_id: auction._id}, {sold: 'true'}, {new: true, runValidators: true});

        let productCost = maxBid.bidCost;
        let objectInUpdates, walletAmountUpdated;

        for (let i=1;i<biddingArray.length;i++){
            objectInUpdates = {};
            if (biddingArray[i].userID == maxBid.userID){
                continue;
            }
            else{
                walletAmountUpdated = biddingArray[i].bidCost + biddingArray[i].walletAfterBid;
                objectInUpdates.updateOne = {filter: {_id: biddingArray[i].userID}, update: {wallet: walletAmountUpdated}};

                updates.push(objectInUpdates);
            }
        }

        let walletUpdated = await User.bulkWrite(updates);
        
        let newAmountAdmin = Math.ceil(0.05*productCost);
        let newAmountSeller = Math.floor(0.95*productCost);

        let AdminWallet = await Admin.updateOne({_id: '636abe4f086b725042337410'}, {$inc: { wallet: newAmountAdmin}}, {new: true, runValidators: true});

        let sellerID = auction.userID;
        let updateSellerWallet = await User.updateOne({_id: sellerID}, {$inc: { wallet: newAmountSeller}}, {new: true, runValidators: true});

        let newOwnerUpdated  = await Product.updateOne ({_id: auction._id}, {newOwner: maxBid.userID}, {new: true, runValidators: true});

          });

        return sup;
    }
    catch(err){
        console.log('Error')
    }
}