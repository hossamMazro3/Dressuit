const Product = require("../model/product");
const User = require("../model/user");
const Review = require("../model/review");
const path = require("path");
const fs = require("fs");

function errorHandling(errors) {
  const errors_Obj = {};
  for (let e in errors) {
    errors_Obj[errors[e].path] = errors[e].message;
  }
  return errors_Obj;
}

const getProducts = async (req, res, next) => {
  // current page
  const page = req.query.p || 0;
  // the number of page will be returned
  const product_per_page = 3;
  try {
    const result = await Product.find()
      .populate("user", {
        userName: 1,
        image: 1,
      })
      .select({
        reviews: 0,
        __v: 0,
      })
      .skip(page * product_per_page)
      .limit(product_per_page);
    res.status(200).json(result);
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
          select: { userName: 1, image: 1 },
        },
      });
    if (!result) {
      return res.status(404).json("no product specified by this id");
    }
    res.status(200).json(result);
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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

    res.status(201).json("created successfully...");
  } catch (err) {
    const errors = errorHandling(err.errors);
    res.status(400).json({ errors });
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
    if (!updatedProduct) {
      return res.status(404).json("no product specified by this id");
    }
    res.status(200).json("product has successfully updated");
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
      if (!result) {
        return res.status(404).json("no product specified by this id");
      }
      //  delete the product imgs from server
      // path.join(path.dirname(process.mainModule.filename), img);
      // process.mainModule.filename => return location of the main file (app.js)
      // and want to complete path so, we call .dirname to get the complete or absolute path
      process.chdir("./");
      result.Images.forEach((img) => {
        fs.unlink(path.join(process.cwd(), img), (err) => {
          if (err) {
            throw new Error("ooops some error occure");
          }
        });
      });
    }
    res.status(200).json("product has been deleted...");
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
      res.status(201).json("created successfully...");
    }
  } catch (err) {
    const errors = errorHandling(err.errors);
    res.status(400).json({ errors });
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
    if (!result) {
      return res.status(404).json("no review specified by this id");
    }
    res.status(201).json("ur review has been updated successfully");
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
      if (!result) {
        return res.status(404).json("no review specified by this id");
      }
      res.status(200).json("ur review has been removed successfully");
    }
  } catch (err) {
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
    for (let e in err.errors) {
      console.log(err.errors[e].message);
    }
    res.status(400).json("Bad request, some thing goes wrong");
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
