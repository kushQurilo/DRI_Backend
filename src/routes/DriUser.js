const { importUsersFromCSV, getUsersList, searchUserById } = require('../controllers/DriUser')
const csvUpload = require('../middlewares/csvMiddleware')

const driRoute = require('express').Router()
driRoute.post('/',csvUpload.single('csv'),importUsersFromCSV);
driRoute.get('/',getUsersList)
driRoute.get('/search',searchUserById);

module.exports = driRoute;