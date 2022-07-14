const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../model/user");
const CustomError = require('../errorHandling/customError');

module.exports.requireAuth = (req, res, next) => {
    // get the token which exist in the header
    const token = req.header("token");

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.secret_Key, (err, decodedToken) => {
            if (err) {
               throw new CustomError('not authorized to access this page',401);
            } else {
                // send this user to the next middleware
                req.userID = decodedToken.id;
                req.role = decodedToken.role;
                
                next();
            }
        });
    } else {
        throw new CustomError('not authorized to access this page',401);
    }
};