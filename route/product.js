const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addReview,
  modifyReview,
  deleteReview,
  add_favItems,
  get_favItems,
  delete_favItems,
} = require("../controller/product");
const { requireAuth } = require("../utilities/Auth");
const { uploadMultiImgs } = require("../utilities/multer");
const { resizeImages } = require("../middleware/imgProccessing");
const authorizePermissions = require("../middleware/permission");
// setup router
const router = require("express").Router();

// get method to get product docs
router.get(
  "/product",
  requireAuth,
  authorizePermissions("admin", "user"),
  getProducts
);

// get the specific product by id
router.get("/product/:id", requireAuth, getProduct);

// post method to add a product doc
router.post(
  "/product",
  requireAuth,
  uploadMultiImgs([
    {
      name: "images",
      maxCount: 5,
    },
  ]),
  resizeImages,
  addProduct
);

// patch method to modify the specific product by id
router.patch(
  "/product/:id",
  requireAuth,
  uploadMultiImgs([{
    name: 'images',
    maxCount: 5,
  },]),
  resizeImages,
  updateProduct
);

// delete method to delete the specific product by id
router.delete(
  "/product/:id",
  requireAuth,
  authorizePermissions("admin", "user"),
  deleteProduct
);
// add a review on specific product
router.post("/product/:id/review", requireAuth, addReview);
// modify specific review
router.patch("/product/:id/review/:revID", requireAuth, modifyReview);
// delete specific review
router.delete("/product/:id/review/:revID", requireAuth, deleteReview);
// post method to add a product to favItems
router.post("/favItem/:id", requireAuth, add_favItems);
// get method to get favItems
router.get("/favItem", requireAuth, get_favItems);
// delete method to delete a product from favItems
router.delete("/favItem/:id", requireAuth, delete_favItems);

module.exports = router;
