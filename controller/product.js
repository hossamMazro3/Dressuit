const Product = require("../model/product");
const User = require("../model/user");
const Review = require("../model/review");
const asyncWrapper = require("../middleware/asyncWrapper");
const CustomError = require("../errorHandling/customError");
// get all products
const getProducts = asyncWrapper(async (req, res, next) => {
  // current page
  const page = req.query.p || 0;
  // the number of page will be returned
  const product_per_page = 5;
  // search by product title
  const search = req.query.search || ""
  const result = await Product.find({$or:[{title:{$regex:search,$options:"i"}},{description:{$regex:search,$options:"i"}}]})
    .populate({
      path: "user",
      select: "userName ",
    })
    .select("title price images size ")
    .skip(page * product_per_page)
    .limit(product_per_page);
  res.status(200).json(result);
});
// get specific product
const getProduct = asyncWrapper(async (req, res, next) => {
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
        select: { userName: 1, image: 1 },
      },
    })
    .select({
      __v: 0,
    })
  if (!result) {
    return next(new CustomError("no product specified by this id", 404));
  }
  res.status(200).json(result);
});
// add a product
const addProduct = asyncWrapper(async (req, res, next) => {
  let size = {};
  if (typeof req.body.size == "string") {
    size = JSON.parse(req.body.size);
  } else {
    size = req.body.size;
  }
  const newProduct = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    size: size,
    color: req.body.color,
    type: req.body.type,
    purpose: req.body.purpose,
    images: req.body.images,
    user: req.userID,
  };
  const result = await Product.create(newProduct);
  if (result) {
    // add this product to user
    await User.findByIdAndUpdate(result.user._id, {
      $push: { products: result._id },
    });
  }
  res.status(201).json("created successfully...");
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );
  if (!updatedProduct) {
    return next(new CustomError("no product specified by this id", 404));
  }
  res.status(200).json("product has successfully updated");
});

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const result = await Product.findByIdAndDelete(req.params.id);
  // delete all review on that product
  if (result) {
    await Review.deleteMany({
      _id: { $in: result.reviews },
    });
  } else {
    return next(new CustomError("no product specified by this id", 404));
  }
  res.status(200).json("product has been deleted...");
});

//methods to deal with Review

const addReview = asyncWrapper(async (req, res, next) => {
  const newReview = {
    user: req.userID,
    product: req.params.id,
    content: req.body.content,
  };
  const result = await Review.create(newReview);
  if (result) {
    await Product.findByIdAndUpdate(
      req.params.id,
      {
        $push: { reviews: result._id },
      },
      { new: true }
    );
    res.status(201).json("created successfully...");
  }
});

const modifyReview = asyncWrapper(async (req, res, next) => {
  const result = await Review.findByIdAndUpdate(
    req.params.revID,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );
  if (!result) {
    return next(new CustomError("no review specified by this id", 404));
  }
  res.status(201).json("ur review has been updated successfully");
});

const deleteReview = asyncWrapper(async (req, res, next) => {
  const result = await Review.findByIdAndDelete(req.params.revID);
  // and delete review ref from review array in product model
  if (result) {
    await Product.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.revID },
    });
  } else {
    return next(new CustomError("no review specified by this id", 404));
  }
  res.status(200).json("ur review has been removed successfully");
});

// mehtods to deal with Favourit product

// add item to favList
const add_favItems = asyncWrapper(async (req, res, next) => {
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
});

// display favList
const get_favItems = asyncWrapper(async (req, res, next) => {
  const result = await User.findById(req.userID)
    .select("favItems -_id")
    .populate({
      path: "favItems",
      select: "title price images size ",
      populate: {
        path: "user",
        select: "userName",
      },
    });

  if (result) {
    res.status(200).json(result);
  }
});

// delate item from favList
const delete_favItems = asyncWrapper(async (req, res, next) => {
  const result = await User.findByIdAndUpdate(req.userID, {
    $pull: { favItems: req.params.id },
  });
  if (result) {
    res.status(200).json("delete from favList");
  }
});

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
