// models/ExcelData.js
const mongoose = require('mongoose');

const excelDataSchema =  new mongoose.Schema({}, { strict: false })

module.exports = mongoose.model('ExcelData', excelDataSchema);
