const nodemailer = require("nodemailer");
const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel')

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
        res.status(404).json({status: 404, message: 'fail', data: err.msg});
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
        res.status(404).json({status: 404, message: 'fail', data: err.msg});
    }
}