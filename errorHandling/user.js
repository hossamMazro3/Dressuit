const CustomError = require('./customError');
// handle errors
const userError = (err,req,res,next) => {

  for (let e in err.errors) {
    // console.log(err.errors[e]);
    return next(new CustomError(err.errors[e].message,400));
  }
  
  // duplicate email error
  if (err.code === 11000) {
    return next(new CustomError("that email is already registered",400));
  }

  // now i throw two errors in login function
  // incorrect email
  if (err.message === "incorrect email") {
    return next(new CustomError("That email is not registered",400));
  }

  // incorrect password
  if (err.message === "incorrect password") {
    return next(new CustomError("That password is incorrect",400));
  }
  else{
    return next();
  }
};

module.exports ={
  userError
};
