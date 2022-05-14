const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../model/user");

module.exports.requireAuth = (req, res, next) => {
    // get the token which exist in the header
    const token = req.header("token");

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.secret_Key, (err, decodedToken) => {
            if (err) {
                res.status(401).json({
                    errors:'not authorized to access this page'
                })
            } else {
                let userID = decodedToken.id
                // send this user to the next middleware
                req.userID = userID;
                next();
            }
        });
    } else {
        res.status(401).json({
            errors:'not authorized to access this page'
        })
    }
};