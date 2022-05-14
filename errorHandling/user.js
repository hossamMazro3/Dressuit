// handle errors
const handleErrors = (err) => {
  // console.log(err.message, err.code);
  // console.log(err);
  // envery err.message contains 'User validation failed'
  // validation errors
  let errors = {};
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(properties);
      // now the property has a message and path
      // i want to add the message to email property on errors obj
      errors[properties.path] = properties.message;
    });
    return errors;
  }
  // now another error is happen when i signed with existing email
  // i told mongoose it unique but unique property donnot accept message like require
  // but it send errCode that =11000 to us so,
  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // now i throw two errors in login function
  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
    return errors;
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
    return errors;
  }
  else{
    return "Bad request, some thing goes wrong"
  }
};

module.exports.userError = (err, req, res, next) => {
  const errors = handleErrors(err);
  res.status(400).json({ errors });
};
