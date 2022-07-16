const sharp = require("sharp");
const asyncWrapper = require("../middleware/asyncWrapper");
const { v4: uuidv4 } = require("uuid");

// Image processing
module.exports.resizeImage = asyncWrapper(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

module.exports.resizeImages = asyncWrapper(async (req, res, next) => {
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(1080, 1080)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});
