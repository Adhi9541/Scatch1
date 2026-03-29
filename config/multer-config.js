const multer = require("multer");

const storage = multer.memoryStorage(); // Store uploaded files in memory as Buffer objects
const upload = multer({ storage: storage }); // Create a multer instance with the defined storage configuration

module.exports = upload;