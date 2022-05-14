const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/user");
const Product = require("../model/product");
const Review = require("../model/review");
const path = require("path");
const fs = require("fs");


// method for creating a token
function createToken(id) {
  return jwt.sign({ id }, process.env.secret_Key, {
    expiresIn: "7d",
  });
}

// allowed for admines only
const getUsers = async (req, res, next) => {
  try {
    const result = await User.find({});

    res.status(200).json(result);
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong")
  }
};

const getUser = async (req, res, next) => {
  try {
    const result = await User.findById(req.params.id)
      .populate("products", {
        title: 1,
        description: 1,
        Images: 1,
      })
      .select("-favItems");

      if(!result){
       return res.status(404).json("no user specified by this id");
      }
    res.status(200).json(result);
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong")
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
    res.header("x-auth-token", token);
    res.status(201).json({ userID: result._id });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const result = await User.login(email, password);
    const token = createToken(result._id);
    res.header("x-auth-token", token)
    res.status(200).json({ userID: result._id});
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

    if(!updatedUser){
     return res.status(404).json("no user specified by this id");
    }
    res.status(200).json("user has been updated...");
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong")
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    //  delete all product asscoiated with this user
    if (result) {
      await Review.deleteMany({
        user: result._id,
      });
      await Product.deleteMany({
        _id: { $in: result.products },
      });

      //  delete the user img from server
      process.chdir("./");
      fs.unlink(path.join(process.cwd(), result.image), (err) => {
        if (err) {
          throw new Error("ooops some error occure");
        }
      });
    }
    if(!result){
      return res.status(404).json("no product specified by this id");
    }
    res.status(200).json("user has been deleted...");
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong")
  }
};


module.exports = {
  getUsers,
  getUser,
  addUser,
  login,
  updateUser,
  deleteUser
};
