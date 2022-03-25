const Product = require("../model/product");
const User = require("../model/user");
const Review = require("../model/review");
const path = require("path");
const fs = require("fs");

const getProducts = async (req, res, next) => {
  try {
    const result = await Product.find()
      .populate("user", {
        userName: 1,
        image: 1,
      })
      .select({
        reviews: 0,
        __v: 0,
      });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const result = await Product.findById(req.params.id)
      .populate("user", {
        userName: 1,
        image: 1,
      })
      .populate({
        path: "reviews",
        select: { content: 1 },
        populate: {
          path: "user",
          select: { userName: 1 },
        },
      });
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
    type: req.body.type,
    purpose: req.body.purpose,
    Images: imgArray,
    user: req.userID,
  };
  try {
    const result = await Product.create(newProduct);
    if (result) {
      // add this product to user
      await User.findByIdAndUpdate(result.user._id, {
        $push: { products: result._id },
      });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const updateProduct = async (req, res, next) => {
  // check of productImages if you want to change uploaded images
  // takes it and added to property images (array)  which added to body obj
  if (req.files) {
    req.body.Images = [];
    req.files.forEach((element) => {
      req.body.Images.push(element.path);
    });
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      msg: "product has successfully updated",
      updatedProduct,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    // delete all review on that product
    if (result) {
      await Review.deleteMany({
        _id: { $in: result.reviews },
      });
      //  delete the product imgs from server
      process.chdir("./");
      result.Images.forEach((img) => {
        fs.unlink(path.join(process.cwd(), img), (err) => {
          if (err) {
            throw new Error("ooops some error occure");
          }
        });
      });
    }
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

//methods to deal with Review

const addReview = async (req, res, next) => {
  const newReview = {
    user: req.userID,
    product: req.params.id,
    content: req.body.content,
  };
  try {
    const result = await Review.create(newReview);
    if (result) {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $push: { reviews: result._id },
        },
        { new: true }
      );
      res.status(200).json(product);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const modifyReview = async (req, res, next) => {
  try {
    const result = await Review.findByIdAndUpdate(
      req.params.revID,
      {
        $set: req.body,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json("ur review has been updated successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const result = await Review.findByIdAndDelete(req.params.revID);
    // and delete review ref from review array in product model
    if (result) {
      const new_product = await Product.findByIdAndUpdate(req.params.id, {
        $pull: { reviews: req.params.revID },
      });
      res.status(200).json("ur review has been removed successfully");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// mehtods to deal with Favourit product

// add item to favList
const add_favItems = async (req, res, next) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.userID,
      {
        $addToSet: { favItems: req.params.id },
      },
      { new: true }
    );
    if (result) {
      res.status(200).json("added to favList");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// display favList
const get_favItems = async (req, res, next) => {
  try {
    const result = await User.findById(req.userID)
      .select("favItems -_id")
      .populate("favItems");

    if (result) {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// delate item from favList
const delete_favItems = async (req, res, next) => {
  try {
    const result = await User.findByIdAndUpdate(req.userID, {
      $pull: { favItems: req.params.id },
    });
    if (result) {
      res.status(200).json("delete from favList");
    }
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
  add_favItems,
  get_favItems,
  delete_favItems,
};
