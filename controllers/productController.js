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
        res.status(404).json({status: 404, message: 'fail', data: err.msg})
    }
}