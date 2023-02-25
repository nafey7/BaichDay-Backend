// Packages imported
const express = require('express');
const dotenv = require('dotenv')
dotenv.config({path: './config.env'});
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const socket = require("socket.io");

// Routes imported
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const productRoute = require('./routes/productRoute');


const app = express();

// Server starting at a specific port number
const port = process.env.PORT;
const server = app.listen(port, ()=> {
    console.log("App is running on port:",port);
});

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
    
    let req_time2 = new Date();

    let date = req_time2.getDate()+'/'+(req_time2.getMonth()+1)+'/'+req_time2.getFullYear();
    let time = req_time2.getUTCHours()+':'+req_time2.getMinutes();

    console.log('Date of request:', req_time2.getDate()+'/'+(req_time2.getMonth()+1)+'/'+req_time2.getFullYear());
    console.log('Time of the request:', req_time2.getUTCHours()+':'+req_time2.getMinutes());

    req.body.dateApi = date;
    req.body.timeApi = time;
    
    next();
});

// Middleware to assign a socket to user as soon as they open the chat feature of the web application (Front-End side)
app.use((req,res,next) => {

    if (req.body.chat){
        // console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
        const io = socket(server, {
            cors: {
                origin: "*",
              },
        });

        req.io = io;
    }

    next();
})

// Middlewares to direct the requests to their respective routes.
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/product', productRoute);

