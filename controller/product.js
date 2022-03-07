const Product = require("../model/product");
const User = require("../model/user");
const Review = require("../model/review");

const getProducts = async (req, res, next) => {
  try {
    const result = await Product.find().populate("user", {
      userName: 1,
      image: 1,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const result = await Product.findById(req.params.id).populate('user',{
      userName:1,
      image:1
    }).populate('reviews',{content:1});

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const addProduct = async (req, res, next) => {
  let imgArray = [];
  req.files.forEach((element) => {
    imgArray.push(element.path);
  });
  const newProduct = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    size: JSON.parse(req.body.size),
    color: req.body.color,
    purpose: req.body.purpose,
    Images: imgArray,
    user: req.userID,
  };
  try {
    const result = await Product.create(newProduct);
    if (result) {
      // add this product to user
      await User.findByIdAndUpdate(result.user._id, {
        $push:{products:result._id},
      });
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const updateProduct = async (req, res, next) => {
  // check of productImages if you want to change uploaded images
    // takes it and added to property images (array)  which added to body obj
    if (req.files) {
      req.files.forEach((element) => {
        req.Images.push(element.path);
      });
    };
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        msg:"product has successfully updated",
        updatedProduct
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
};

const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

//methods to deal with Review

const addReview = async (req,res,next)=>{
  const newReview = {
    user:req.userID,
    product:req.params.id,
    content: req.body.content,
  }
  try {
    const result = await Review.create(newReview)
    if(result){
      const product = await Product.findByIdAndUpdate(req.params.id,{
        $push:{reviews:result._id}
      },
      { new: true }
      );
      res.status(200).json(product)
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const modifyReview = async(req,res,next)=>{
  try {
    const result = await Review.findByIdAndUpdate(req.params.revID,{
      $set:req.body,
    });
    res.status(200).json('ur review has been updated successfully')
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteReview = async(req,res,next)=>{
  try {
    const result = await Review.findByIdAndDelete(req.params.revID);
    res.status(200).json('ur review has been removed successfully')
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addReview,
  modifyReview,
  deleteReview,
};
