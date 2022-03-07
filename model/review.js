const mongoose = require("mongoose");

// creat a reviewsSchema
const reviewsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  content: {
    type: String,
    required: [true, "please enter your review"],
    minlength: [5, "your description must be at least contains 5 characters"],
    maxlength: [255, "your description shouldn/'t exceed 255 characters"],
  },
});

module.exports = mongoose.model("Rview", reviewsSchema);
