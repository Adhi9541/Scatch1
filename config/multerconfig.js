const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

/*  DiskStorage
The disk storage engine gives you full control on storing files to disk*/

// the upload.single("image=> ya image hama index.ejs <input type="file" name="image"> yaha sa ")


// disk storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      const fn = raw.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  }
})


// export upload variable
const upload1 = multer({ storage: storage })

module.exports = upload1;