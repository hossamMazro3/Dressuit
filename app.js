const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const userRoute = require("./route/user");
const productRoute = require("./route/product");
const orderRoute = require('./route/order');
const cors = require("cors");
const  globalErrorhandling  = require("./errorHandling/globalErrorHandling");
const CustomError = require("./errorHandling/customError");
const helmet = require("helmet");
const compression = require('compression');
var hpp = require('hpp');
const rateLimit = require('express-rate-limit');
// setup app to use express functionality
const app = express();

// setup docs for all apis
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// db connection
mongoose.connect(process.env.DB_URL, (err) => {
  if (err) throw new Error("can not establish a connection to DB");

  console.log("connection establish successfully");
});
// run the server to listen to requests
const server = app.listen(process.env.PORT || 5000, () => {
  console.log("server is running");
});
mongoose.Promise = global.Promise;

// middlwares

// Enable other domains to access your application
app.use(cors());


app.set("trust proxy", true);

app.use(helmet());

// compress all responses
app.use(compression());

// access to static uploads folder contents
app.use(express.static("uploads"));
// parse requests of content-type - application/json
app.use(express.json({ limit: '20kb' }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// setup logger middleware (needed for dev)
if (process.env.Node_ENV == "development") {
  app.use(morgan("dev"));
}

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    'Too many accounts created from this IP, please try again after an hour',
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

// Parse Cookie header
app.use(cookieParser());
// protect against HTTP Parameter Pollution attacks
app.use(hpp());
// setup routes for user and product
app.use("/api", userRoute);
app.use("/api", productRoute);
app.use("/api", orderRoute);
// setup routes for api docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// not found route
app.all("*", (req, res, next) => {
  next(new CustomError(`Can't find this route: ${req.originalUrl}`, 400));
});

// define global object
app.use(globalErrorhandling);

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});

// Handle uncaughtException outside express
process.on("uncaughtException", (err) => {
  console.error(`uncaughtException Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
