const express = require('express');
const dotenv = require('dotenv')
dotenv.config({path: './config.env'});
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

mongoose.connect(process.env.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Sucessfully connected to Database"))
    .catch((err) => console.log(err));


app.use(morgan('dev'));
app.use(express.json({limit: '10mb'}));

// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:4000', 'http://localhost:3000'];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//          res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.header('Access-Control-Allow-Credentials', true);
//     return next();
//   });


// app.use((req,res,next) => {
//     let req_time = new Date().toISOString();
//     console.log('The time of the request:',req_time);
//     next();
// });



const port = process.env.PORT;
app.listen(port, ()=> {
    console.log("App is running on port:",port);
});