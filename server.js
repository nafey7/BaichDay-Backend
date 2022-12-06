// Packages imported
const express = require('express');
const dotenv = require('dotenv')
dotenv.config({path: './config.env'});
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes imported
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const productRoute = require('./routes/productRoute');


const app = express();

// Database connecting to Backend Server
mongoose.connect(process.env.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Sucessfully connected to Database"))
    .catch((err) => console.log(err));


app.use(morgan('dev'));
app.use(express.json({limit: '10mb'}));

// Middleware to allow frontend links which can access the server
app.use((req, res, next) => {
    const allowedOrigins = ['https://63764ffe6cf2ba262ac49354--baichday.netlify.app','http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });


  // Middleware to display time at which each request was made
app.use((req,res,next) => {
    let req_time = new Date().toISOString();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let dateArray = req_time.split('T')[0].split('-');
    let month = parseInt(dateArray[1]);
    month = monthNames[month-1];

    let date = month + " " + dateArray[2] + " " + dateArray[0];
    req.body.timeApi  = date;
    console.log('Date of request:',date);
    console.log('Time of request:', req_time.split('T')[1]);
    
    next();
});

// Middlewares to direct the requests to their respective routes.
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/product', productRoute);


// Server starting at a specific port number
const port = process.env.PORT;
app.listen(port, ()=> {
    console.log("App is running on port:",port);
});