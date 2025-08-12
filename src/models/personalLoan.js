const mongoose = require('mongoose');
const personalLoanSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'user missing']
    },
    bankName:{
        type:String,
        required:[true , 'bank required']
    },
    principle:{
        type:Number,
        required:true
    },
    estimatedSettlement:{
        type:Number,
        required:true
    },
    estimatedSaves:{
        type:Number,
        required:true
    },
    loanType:{
        type:String,
        required:true
    }
});
const personalLoanModel = new mongoose.model('personalloans', personalLoanSchema);
module.exports = personalLoanModel;