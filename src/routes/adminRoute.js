const { createAdmin, loginAdmin, addBarcodeWithUpi, updateAdminDetails, getAdminDetails, getBarcodeAndUpi, uploadProfileImage, adminDashboardBanner, addLoginBackground, getAdminAnsLoginBanner, getAdminProfileAndBanner } = require('../controllers/admin/adminControll');
const { AuthMiddleWare } = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/bannerMiddleware');
const limiter = require('../middlewares/rateLimitMiddleware');
const { roleAuthenticaton } = require('../middlewares/roleBaseAuthentication');
const UploadSingleImage = require('../middlewares/singleImageUpload');

const adminRouter = require('express').Router();
adminRouter.post('/',createAdmin);
adminRouter.post('/login',limiter,loginAdmin);
adminRouter.put('/profile-update',AuthMiddleWare,UploadSingleImage.single('image'),uploadProfileImage);
adminRouter.put('/',upload.single('barcode'),AuthMiddleWare,roleAuthenticaton('admin'),addBarcodeWithUpi);
adminRouter.put('/update-details',AuthMiddleWare,roleAuthenticaton('admin'),updateAdminDetails)
adminRouter.get('/get-details',AuthMiddleWare,roleAuthenticaton('admin'),getAdminDetails);
adminRouter.get('/barcode-details',AuthMiddleWare,roleAuthenticaton('admin',"user"),getBarcodeAndUpi);
adminRouter.post('/admindashboardbanner',AuthMiddleWare,UploadSingleImage.single('image'),adminDashboardBanner)
adminRouter.get('/getadminBanner',getAdminAnsLoginBanner);
adminRouter.get('/adminProfileBanner',getAdminProfileAndBanner);
module.exports = adminRouter;