const paypal = require("paypal-rest-sdk");
require("dotenv").config();
const Order = require("../model/order");
const asyncWrapper = require("../middleware/asyncWrapper");
const CustomError = require("../errorHandling/customError");

// congig
paypal.configure({
  mode: process.env.PAYPAL_MODE, //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const createPayment = async (req, res,next) => {
    // get some oreder info 
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(
        new CustomError(
          `There is no such a order with this req.params.id:${req.params.id}`,
          404
        )
      );
    }

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `http://localhost:3000/api/order/${req.params.id}/success`,
      cancel_url: "http://localhost:3000/api/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: `${order.product.title}`,
              price: `${order.totalPrice}`,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: `${order.totalPrice}`,
        },
        description: "This is the payment description.",
      },
    ],
  };
  payment_json = JSON.stringify(create_payment_json);
  paypal.payment.create(payment_json, function (error, payment) {
    if (error) {
     return next(new CustomError(error.response.message,error.response.httpStatusCode))
    } else {
      for (var i = 0; i < payment.links.length; i++) {
        //Redirect user to this endpoint for redirect url
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
};

const successPayment = async(req, res,next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(
          new CustomError(
            `There is no such a order with this req.params.id:${req.params.id}`,
            404
          )
        );
      }

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: `${order.totalPrice}`,
        },
      },
    ],
  };
  execute_pay_json = JSON.stringify(execute_payment_json)
  paypal.payment.execute(
    paymentId,
    execute_pay_json,
    function (error, payment) {
      if (error) {
        return next(new CustomError(error.response.message,error.response.httpStatusCode))
      } else {
        // console.log(JSON.stringify(payment));
        res.status(200).json("success")
      }
    }
  );
};
module.exports = {
  createPayment,
  successPayment,
};
