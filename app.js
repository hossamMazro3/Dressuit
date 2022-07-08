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
// setup app to use express functionality
const app = express();

// setup docs for all apis
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// db connection
mongoose.connect(`mongodb://localhost/${process.env.DB_Name}`, (err) => {
  if (err) throw new Error("can not establish a connection to DB");

  console.log("connection establish successfully");
});
// run the server to listen to requests
const server = app.listen(process.env.port || 3000, () => {
  console.log("server is running");
});
mongoose.Promise = global.Promise;

// middlwares
//
app.use(cors());
// access to static uploads folder contents
app.use("/uploads", express.static("uploads"));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// setup logger middleware (needed for dev)
if (process.env.Node_ENV == "development") {
  app.use(morgan("dev"));
}

// Parse Cookie header
app.use(cookieParser());

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
