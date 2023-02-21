const Product = require('../models/productModel');


exports.ViewProducts = async (req,res) => {
    try{

        const query = Product.find({
            sold: false
        })
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
        let filter = {_id: req.body.productID};
        let update = {sold: true};

        const query = Product.findOne(filter);
        const findProduct = await query;

        const now = new Date();
        const timestamp = now.getTime();
        const nowDate = new Date(timestamp);
        
        const diffTime = findProduct.endTime - nowDate;

        let timeRemaining = Math.ceil(diffTime / (1000));

        
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