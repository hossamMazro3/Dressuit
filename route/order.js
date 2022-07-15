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
const authorizePermissions = require("../middleware/permission");

const{ createPayment,successPayment} = require('../controller/paypal');
// setup router
const router = require("express").Router();

// create an order
router.post("/order", requireAuth, createOrder);

// get an order associated this current user
router.get("/userOrder", requireAuth, currentUserOrders);

// get an order=> Protected for (Admin,Manager)
router.get("/order/:id", requireAuth,authorizePermissions("admin"), getOrder);

// get all orders 
router.get("/order", requireAuth,authorizePermissions("admin"), getAllOrders);

// update an order
router.patch("/order/:id", requireAuth,authorizePermissions("admin","user"), changeOrder);

// delete an order => Protected for (Admin,Manager)
router.delete("/order/:id", requireAuth, authorizePermissions("admin"),deleteOrder);

//Update order paid status
router.patch("/order/:id/pay", requireAuth, authorizePermissions("admin"),toPaid);

//Update order delivered status => Protected for (Admin,Manager)
router.patch("/order/:id/deliver", requireAuth,authorizePermissions("admin"), toDelivered);

// paypal payment 
router.get('/order/:id/payment',requireAuth,authorizePermissions("user"),createPayment)
// paypal payment success 
router.get('/order/:id/success',successPayment)


module.exports = router;
