const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/user");
const Product = require("../model/product");
const Review = require("../model/review");

const maxAge = 15 * 24 * 60 * 60;
// method for creating a token
function createToken(id) {
  return jwt.sign({ id }, process.env.secret_Key, {
    expiresIn: maxAge,
  });
}

// allowed for admines only
const getUsers = async (req, res, next) => {
  try {
    const result = await User.find({});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getUser = async (req, res, next) => {
  try {
    const result = await User.findById(req.params.id).populate('products',{
      title:1,
      description:1,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const addUser = async (req, res, next) => {
  const newUser = {
    userName: req.body.userName,
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    gender: req.body.gender,
    birthday: req.body.birthday,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
  };
  try {
    const result = await User.create(newUser);
    const token = createToken(result._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.status(200).json({ user: result._id });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const result = await User.login(email, password);
    const token = createToken(result._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.status(200).json({ user: result._id });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
    // check of userImage if you want to change defualt image
    // takes it and added to property image which added to body obj
  if (req.file) {
    req.body.image = req.file.path;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json("user has been updated...");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteUser = async (req, res, next) => {
  try {
   const result= await User.findByIdAndDelete(req.params.id);
  //  delete all product asscoiated with this user
  // console.log(result);
    if(result){
      await Review.deleteMany({
        user:result._id
      });
      await Product.deleteMany({
        _id:{$in:result.products}
      })
    }
    res.status(200).json("user has been deleted...");
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const logout = (req,res,next)=>{
  res.cookie("jwt", "", { maxAge: 1 });
  // res.clearCookie('jwt'); another way
  res.status(200).json({
    msg:'succssfull logout, bye'
  })
}

module.exports= {
  getUsers,
  getUser,
  addUser,
  login,
  updateUser,
  deleteUser,
  logout
};

