const { requireAuth } = require("../utilities/Auth");
const {
  createOrder,
  getOrder,
  getAllOrders,
  currentUserOrders,
  changeOrder,
  deleteOrder,
  toPaid,
  toDelivered,
} = require("../controller/order");

const{ createPayment,successPayment} = require('../controller/paypal');
// setup router
const router = require("express").Router();

// create an order
router.post("/order", requireAuth, createOrder);

// get an order associated this current user
router.get("/userOrder", requireAuth, currentUserOrders);

// get an order=> Protected for (Admin,Manager)
router.get("/order/:id", requireAuth, getOrder);

// get all orders 
router.get("/order", requireAuth, getAllOrders);

// update an order
router.patch("/order/:id", requireAuth, changeOrder);

// delete an order => Protected for (Admin,Manager)
router.delete("/order/:id", requireAuth, deleteOrder);

//Update order paid status
router.patch("/order/:id/pay", requireAuth, toPaid);

//Update order delivered status => Protected for (Admin,Manager)
router.patch("/order/:id/deliver", requireAuth, toDelivered);

// paypal payment 
router.get('/order/:id/payment',createPayment)
// paypal payment success 
router.get('/order/:id/success',successPayment)


module.exports = router;
