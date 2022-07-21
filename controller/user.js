const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/user");
const asyncWrapper = require("../middleware/asyncWrapper");
const CustomError = require("../errorHandling/customError");
const Product = require("../model/product");
const Review = require("../model/review");
const crypto = require("crypto");
const sendEmail = require("../utilities/mail");

// method for creating a token
function createToken(id,role) {
  return jwt.sign({ id,role }, process.env.secret_Key, {
    expiresIn: "7d",
  });
}

// allowed for admines only
const getUsers = asyncWrapper(async (req, res, next) => {
  // current page
  const page = req.query.p || 0;
  // the number of page will be returned
  const user_per_page = 10;
  // search by user name
  const search = req.query.search || ""
  const result = await User.find({$or:[{userName:{$regex:search,$options:"i"}},{fullName:{$regex:search,$options:"i"}}]})
    .select(
      "userName email role createdAt updatedAt"
    )
    .skip(page * user_per_page)
    .limit(user_per_page);

  res.status(200).json(result);
});

const getUser = asyncWrapper(async (req, res, next) => {
  const result = await User.findById(req.params.id)
    .populate({
      path: "products",
      select: "title price images size ",
    })
    .select(
      "-password -__v -favItems -passwordResetCode -passwordResetExpires -passwordResetVerified -createdAt -updatedAt"
    );

  if (!result) {
    return next(new CustomError("no user specified by this id", 404));
  }
  res.status(200).json(result);
});

const addUser = asyncWrapper(async (req, res, next) => {
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

  const result = await User.create(newUser);
  const token = createToken(result._id,result.role);
  res.status(201).json({ userID: result._id, token });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await User.login(email, password);
  const token = createToken(result._id,result.role);
  res.status(200).json({ userID: result._id, token });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new CustomError("no user specified by this id", 404));
  }
  res.status(200).json({
    msg:"user has been updated...",
  });
});
// update user's password
const updateUserPassword = asyncWrapper(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new CustomError("Please provide both values", 400));
  }
  const { isMatch, user } = await User.comparePassword(req.userID, oldPassword);
  if (!isMatch) {
    return next(new CustomError("incorrect password", 400));
  }
  user.password = newPassword;

  await user.save();
  res.status(200).json({
    msg: "password has been updated...",
  });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const result = await User.findByIdAndDelete(req.params.id);
  //  delete all product asscoiated with this user
  if (result) {
    await Review.deleteMany({
      user: result._id,
    });
    await Product.deleteMany({
      _id: { $in: result.products },
    });
  }
  if (!result) {
    return next(new CustomError("no user specified by this id", 404));
  }
  res.status(200).json({
    msg: "user has been deleted...",
  });
});

// forget the user's password
const forgotPassword = async (req, res, next) => {
  // 1- Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new CustomError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.userName},\n We received a request to reset the password on your Dressuit Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Dressuit Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    console.log(err);
    return next(new CustomError("There is an error in sending email", 500));
  }
  res.status(200).json({
    msg: "email has been sent...",
  });
};

let email = "";
// Verify password reset code
const VerifyRestCode = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new CustomError("Reset code invalid or expired", 401));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  email = user.email;
  res.status(200).json({
    msg: "reset code has been verified...",
  });
});

// Reset password
const resetPassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError(`There is no user with email ${email}`, 404));
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new CustomError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();
  // 3) if everything is ok, redirect to login with new password;
  res.status(200).json({
    msg: "password has been reset...",
  });
});

module.exports = {
  getUsers,
  getUser,
  addUser,
  login,
  updateUser,
  deleteUser,
  updateUserPassword,
  forgotPassword,
  VerifyRestCode,
  resetPassword,
};
