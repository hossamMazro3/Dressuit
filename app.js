const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan')
require('dotenv').config();
const cookieParser = require('cookie-parser');
const userRoute = require('./route/user');
const productRoute = require('./route/product');
const cors = require('cors');
// setup app to use express functionality
const app = express();

// setup docs for all apis
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// db connection
mongoose.connect(`mongodb://localhost/${process.env.DB_Name}`,(err=>{
    if(err) throw new Error('can not establish a connection to DB');

    console.log('connection establish successfully');
    // run the server to listen to requests
    app.listen(process.env.port ||3000,()=>{
        console.log('server is running');
    });
}));
mongoose.Promise = global.Promise;

// middlwares
// 
app.use(cors());
// access to static uploads folder contents
app.use('/img',express.static('uploads'));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// setup logger middleware
app.use(morgan('dev'));
// Parse Cookie header 
app.use(cookieParser());

// setup routes for user and product
app.use('/api',userRoute);
app.use('/api',productRoute);
// setup routes for api docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
