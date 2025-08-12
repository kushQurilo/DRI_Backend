const mongoose = require('mongoose');
const InvoiceSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
    },
    InvoiceDate:{
        type:Date
    },
    ServiceName:{
        type:String
    },
    TotalAmount:{
        type:String
    },
    url:{
        type:String
    }
}, { strict: false });

const InvoiceModel = mongoose.model('Invoice', InvoiceSchema);
module.exports = InvoiceModel;


