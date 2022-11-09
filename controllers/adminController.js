const pbkdf2 = require('pbkdf2');
const jwt = require('jsonwebtoken');

const Admin = require('../models/adminModel');

exports.Login = async (req,res) => {
    try{

        const query = Admin.findOne({
            emailAddress : req.body.emailAddress,
            password: pbkdf2.pbkdf2Sync(req.body.password, 'baichday-secret', 1, 32, 'sha512')
        })
        const Login = await query;

        if (Login == null){
            throw new Error('Email or Password is wrong');
        }

        const token = jwt.sign({id: Login._id}, 'baichday-secret');
        

        res.status(200).json({status: 200, message: 'success', token: token, data: Login});

    }
    catch(err){
        console.log(err);
        res.status(404).json({status: 404, message: 'fail', data: err.message});
    }
}