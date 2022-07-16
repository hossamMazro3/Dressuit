const multer = require("multer");
const CustomeError = require("../errorHandling/customError");
// init multer options
const multerOptions = () => {
  // init storage option
  const storage = multer.memoryStorage();
  // init a fileFilter option
  const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      // accept this file
      cb(null, true);
    } else {
      // reject this file
      cb(new CustomeError("file must be image file", 404), false);
    }
  };
  // init multer upload
  upload = multer({
    storage,
    limits: {
      // file size must be less than or equal 5MB
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
  });

  return upload;
};
exports.uploadSingleImg = (field_name) => multerOptions().single(field_name);
exports.uploadMultiImgs = (arr_of_fields) => multerOptions().fields(arr_of_fields);
