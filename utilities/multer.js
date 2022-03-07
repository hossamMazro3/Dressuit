const multer = require("multer");

// init storage option
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
// init a fileFilter option
const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    // accept this file
    cb(null, true);
  } else {
    cb(new Error("file must be image file"), false);
  }
};
// init multer upload
module.exports.upload = multer({
  storage: storage,
  limits: {
    // file size must be less than or equal 5MB
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
