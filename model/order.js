const mongoose = require("mongoose");

// creat a reviewsSchema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    shippingAddress: {
      type: String,
      required: [true, "please enter your shipping address"],
    },
    totalPrice: {
      type: Number,
    },
    payment: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
orderSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user',
      select: 'userName image email ',
    }).populate({
      path: 'product',
      select: 'title price size images -_id',
    });
  
    next();
  });

module.exports = mongoose.model("Order", orderSchema);
