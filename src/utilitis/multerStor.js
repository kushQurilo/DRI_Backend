const multer = require('multer');
const path = require('path');
const cloudUploader = multer.memoryStorage()
const cloudinaryUploader  = multer({storage:cloudUploader})
module.exports = cloudinaryUploader;