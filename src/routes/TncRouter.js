const TncRoutetr = require('express').Router();
const { addTNC, updateTnc, deleteTnc, getAllTnc } = require('../controllers/termsAndConditionController');
TncRoutetr.post('/add',addTNC);
TncRoutetr.put('/update',updateTnc);
TncRoutetr.delete('/delete',deleteTnc);
TncRoutetr.get('/all',getAllTnc);
module.exports = TncRoutetr;


