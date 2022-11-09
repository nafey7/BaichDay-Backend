const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.Protect = async (req,res, next) => {
    try{
        let token;

        if (!req.body.token){
            throw new Error ('Token is not present');
        }
        token = req.body.token

        const match = await jwt.verify (token, 'baichday-secret');
        const userID = match.id;
        
        const query = User.findById(userID);
        const UserFound = await query;

        
        if (!UserFound){
            throw new Error ('No such user exists');
        }

        req.body.userID = userID;

        next();


    }
    catch(err){
        console.log(err);
        res.status(404).json({status: '404', message: 'fail', data: err.message});
    }
}


exports.ProtectAdmin = async (req,res, next) => {
    try{
        let token;

        if (!req.body.token){
            throw new Error ('Token is not present');
        }
        token = req.body.token

        const match = await jwt.verify (token, 'baichday-secret');
        const adminID = match.id;
        
        const query = User.findById(adminID);
        const UserFound = await query;

        
        if (!UserFound){
            throw new Error ('No such user exists');
        }

        req.body.adminID = adminID;

        next();
    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
} 