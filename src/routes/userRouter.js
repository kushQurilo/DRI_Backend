const { userController, createUser, updateUser, sendOTP, verifyOTP, userSaving, getSavingByMonthYear } = require('../controllers/userControll');
const limiter = require('../middlewares/rateLimitMiddleware');
const { UserAuthMiddleWare } = require('../middlewares/userMiddleware');

const userRouter = require('express').Router();
userRouter.get('/',userController);
userRouter.post('/',createUser);
userRouter.post('/login',limiter,sendOTP);
userRouter.put('/',updateUser);
userRouter.post('/verify-otp',verifyOTP);
userRouter.post('/user-savings', UserAuthMiddleWare, userSaving);
userRouter.get('/get-user',UserAuthMiddleWare,userController)
userRouter.get('/get-user-saving', UserAuthMiddleWare ,getSavingByMonthYear);
module.exports = userRouter;