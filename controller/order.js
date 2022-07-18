const Order = require("../model/order");
const Product = require("../model/product");
const User = require("../model/user");
const asyncWrapper = require("../middleware/asyncWrapper");
const CustomError = require("../errorHandling/customError");

// create the order
const createOrder = asyncWrapper(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;
  const product = await Product.findById(req.query.product);
  const totalPrice = product.price + taxPrice + shippingPrice;
  const newOrder = {
    user: req.userID,
    product: req.query.product,
    shippingAddress: req.body.shippingAddress,
    payment: req.body.payment,
    totalPrice,
  };

  const order = await Order.create(newOrder);
  if (!order) {
    return next(
      new CustomError(
        "your order does not created, please try again later",
        401
      )
    );
  }
  res.status(200).json({
    msg: "order created successfully",
  });
});

// get the order
const getOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new CustomError("not found the order by this id", 404));
  }
  res.status(200).json(order);
});
//  get all orders
const getAllOrders = asyncWrapper(async (req, res) => {
  const orders = await Order.find();
  if (!orders) {
    return next(new CustomError("not found any order", 404));
  }
  res.status(200).json({ orders, count: orders.length });
});

// get all user orders
const currentUserOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find({ user: req.userID })
  if (!orders) {
    return next(new CustomError("no orders", 404));
  }
  res.status(200).json(orders);
});

// update the order
const changeOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );
  if (!order) {
    return next(
      new CustomError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    msg: "order has been updated...",
  });
});

// delete the order
const deleteOrder = asyncWrapper(async (req, res, next) => {
  const orders = await Order.findByIdAndDelete(req.params.id);
  if (!orders) {
    return next(new CustomError("no orders", 404));
  }
  res.status(200).json({
    msg: "order has been deleted...",
  });
});

// Update order paid status
const toPaid = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new CustomError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    msg: "successfully updated order to be paid",
  });
});

//  Update order delivered status
const toDelivered = asyncWrapper(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new CustomError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    msg: "successfully updated order to be delivered",
  });
});

module.exports = {
  createOrder,
  getOrder,
  getAllOrders,
  currentUserOrders,
  changeOrder,
  deleteOrder,
  toPaid,
  toDelivered,
};
