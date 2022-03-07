const{ getProducts, getProduct,  addProduct, updateProduct,  deleteProduct, addReview, modifyReview, deleteReview}= require('../controller/product');
const {requireAuth} = require('../utilities/Auth');
const {upload} = require('../utilities/multer');
// setup router
const router = require("express").Router();

// get method to get product docs
router.get('/product',requireAuth,getProducts);

// get the specific product by id
router.get('/product/:id',requireAuth,getProduct)

// post method to add a product doc
router.post('/product',requireAuth,upload.array("images"),addProduct);

// patch method to modify the specific product by id
router.patch('/product/:id',requireAuth,upload.array("images"),updateProduct);

// delete method to delete the specific product by id
router.delete('/product/:id',requireAuth,deleteProduct);
// add a review on specific product
router.post('/product/:id/review',requireAuth,addReview);
// modify specific review
router.patch('/product/:id/review/:revID',requireAuth,modifyReview);
// delete specific review
router.delete('/product/:id/review/:revID',requireAuth,deleteReview);
module.exports = router;