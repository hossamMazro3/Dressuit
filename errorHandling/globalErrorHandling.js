const globalErrorhandling = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;

  if (process.env.Node_ENV == "development") {
    res.status(err.statusCode).json({
      msg: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json(`${err.message}`);
  }
};

module.exports = globalErrorhandling ;
