const {getUsers, getUser, addUser, login, updateUser, deleteUser,logout} = require('../controller/user');
const {userError} = require('../errorHandling/user');
const {upload} = require('../utilities/multer');
const {requireAuth} = require('../utilities/Auth');

// setup router
const router = require("express").Router();

// get method to get user docs
router.get('/user',requireAuth,getUsers);

// post method to add a user doc
router.post('/user/signup',addUser,userError);

// post method for login
router.post('/user/login',login,userError)

// logout mrthod for test 
router.get('/user/logout',requireAuth,logout)

// get the specific user by id
router.get('/user/:id',requireAuth,getUser);

// patch method to modify the specific user by id
router.patch('/user/:id',requireAuth,upload.single("pofile"),updateUser);

// delete method to delete the specific user by id
router.delete('/user/:id',requireAuth,deleteUser);


module.exports = router;