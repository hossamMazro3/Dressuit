const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../model/user");

module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.secret_Key, async (err, decodedToken) => {
            if (err) {
                res.status(401).json({
                    msg:'not authorized to access this page'
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
            msg:'not authorized to access this page'
        })
    }
};