const { createUPI, getUPI, deleteUPI } = require('../controllers/UPIController');
const UploadSingleImage = require('../middlewares/singleImageUpload');

const QRUPIRouter = require('express').Router();
QRUPIRouter.post('/', UploadSingleImage.single('image'),createUPI);
QRUPIRouter.get('/',getUPI);
QRUPIRouter.delete('/:id',deleteUPI)
module.exports = QRUPIRouter;