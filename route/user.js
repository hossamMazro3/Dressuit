const {
  getUsers,
  getUser,
  addUser,
  login,
  updateUser,
  deleteUser,
  updateUserPassword,
  forgotPassword,
  VerifyRestCode,
  resetPassword,
} = require("../controller/user");
const { userError } = require("../errorHandling/user");
const { upload } = require("../utilities/multer");
const { requireAuth } = require("../utilities/Auth");
const authorizePermissions = require("../middleware/permission");
// setup router
const router = require("express").Router();

// get method to get user docs
router.get("/user", requireAuth, authorizePermissions("admin"), getUsers);

// post method to add a user doc
router.post("/user/signup", addUser, userError);

// post method for login
router.post("/user/login", login, userError);

// get the specific user by id
router.get("/user/:id", requireAuth, getUser);

// patch method to modify the specific user by id
router.patch("/user/:id", requireAuth, upload.single("profile"), updateUser);

// change user's password
router.post("/user/changePass", requireAuth, updateUserPassword);
// forget the user's password
router.post("/user/forgetPassword", forgotPassword);
// Verify password reset code
router.post("/user/VerifyRestCode", VerifyRestCode);
// Reset password
router.post("/user/resetPassword", resetPassword);
// delete method to delete the specific user by id
router.delete(
  "/user/:id",
  requireAuth,
  authorizePermissions("admin", "user"),
  deleteUser
);

module.exports = router;
