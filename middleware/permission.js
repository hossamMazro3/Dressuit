const CustomError = require("../errorHandling/customError");

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      throw new CustomError("not authorized to access this page", 401);
    }
    next();
  };
};

module.exports = authorizePermissions;
