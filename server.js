// Packages imported
const express = require('express');
const dotenv = require('dotenv')
dotenv.config({path: './config.env'});
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const socket = require("socket.io");
const cron = require('node-cron');

// Routes imported
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const productRoute = require('./routes/productRoute');

// Product model imported for the cron job
const Product = require('./models/productModel');


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
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
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

// app.use((req,res,next) => {

//     if (req.body.chat){

        // console.log(req.protocol + '://' + req.get('host') + req.originalUrl);

//         const io = socket(server, {
//             cors: {
//                 origin: "*",
//                 methods: ['GET', 'POST']
//               },
//         });

//         req.io = io;
//     }

//     next();
// })

// Middlewares to direct the requests to their respective routes.
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/product', productRoute);

// Crone to update the status of the products to processing when the end time is over
cron.schedule(`* * * * *`, async () => {

  try{
    // find products whose status is false
    const auctions = await Product.find({ sold: 'false' });

    auctions.forEach(async (auction) => {
          // check the EndTime and Current time of each product
          const expiryTime = new Date(auction.endTime).getTime();
          const currentTime = new Date().getTime();

          // If a product has reached its EndTime, the status of the each product will be changed from false to processing
          if (currentTime > expiryTime) {
            console.log('Processing updated');
            let updateStatus = await Product.updateOne({ _id: auction._id }, { $set: { sold: 'processing' } });
          }
        });
  }
  catch(err){
    console.log(err)
  }
        });

let userArray = [];
let idToRemove = '';
let tempArray = [];
let tempMsg = '';

// Implementing sockets for Chat Feature
const io = socket(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
      },
});

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('userConnected', (userID) => {
      
      idToRemove = userID;
      tempArray = userArray.filter((obj) => obj.userID !== idToRemove);

      userArray = tempArray;
      tempArray = [];
      idToRemove = ''

      userArray.push({userID: userID, socketID: socket.id});
      const userId = socket.handshake.query.userID;
      const socketId = `${userID}-${socket.id}`;
      console.log('This is the handshake queryID', socketId);
      console.log('This is the array of users', userArray);
    });


    socket.on('chat message', (msg, senderID, receiverID) => {
      // I must receive sender's, receiver's id and the message
      tempMsg = ''

      console.log(`Received message: ${msg}`);
      console.log('ID of the sender:', senderID);
      console.log('ID of the receiver:', receiverID);
      console.log('SocketID of the reciever:', userArray.find(obj => obj.userID === receiverID).socketID);

      tempMsg = 'Me: '+msg;
      io.to(userArray.find(obj => obj.userID === senderID).socketID).emit('chat message', tempMsg);
      
      tempMsg = senderID + ': ' +msg;
      io.to(userArray.find(obj => obj.userID === receiverID).socketID).emit('chat message', tempMsg);
      
      // broadcast message to all connected clients
      // io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
              console.log('User disconnected');
            });

  });


// io.on('connection', (socket) => {
//     console.log('New user connected');

  
//     // Receive new messages from client
//     socket.on('message', (data) => {
//       const message = new Message({
//         username: data.username,
//         text: data.text
//       });
  
//       message.save((err) => {
//         if (err) return console.error(err);
//         io.emit('message', message);
//       });
//     });
  
//     // Handle disconnections
//     socket.on('disconnect', () => {
//       console.log('User disconnected');
//     });
//   });
  

