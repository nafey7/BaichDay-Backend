const Product = require('../models/productModel');


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

exports.ViewSingleProduct = async (req,res) => {
    try{

        // This function returns the time remaining (in seconds) of a product which is selected by user on the Front-End side of the application
        
        let filter = {_id: req.body.productID};
        let update = {sold: 'true'};

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


        // If the time for bidding of a particular product is over, then update the sold status of the product from false to true
        if (timeRemaining <= 0){
            const querySecond = Product.updateOne(filter, update, {new: true, runValidators: true});
            const updateStatus = await querySecond;
            timeRemaining = 0;
        }

        res.status(200).json({status: 200, message: 'success', data: timeRemaining})
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message})
    }
}