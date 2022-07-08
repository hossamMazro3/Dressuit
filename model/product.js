const mongoose = require("mongoose");

// creat a productSchema
const productSchema = new mongoose.Schema({
  title: { type: String, required: [true, "please enter product name"] },
  price: { type: Number, required: [true, "please enter product price"] },
  description: {
    type: String,
    minlength: [5, "your description must be at least contains 5 characters"],
    maxlength: [555, "your description shouldn/'t exceed 555 characters"],
  },
  size: {
    name: {
      type: String,
      enum: { values: ["medium", "small", "large", "x-large"], message: ' {VALUE} is not supported ' },
    },
    hieght: { type: Number },
    width: { type: Number },
  },
  color: { type: String },
  type: { type: String },
  publishDate: { type: Date, default: Date.now() },
  purpose: {
    type: String,
    enum: { values: ["rent", "sell"], message: ' {VALUE} is not supported ' },
    default: "rent",
  },
  images: [{ type: String }],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rview",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);
