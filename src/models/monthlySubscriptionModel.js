const mongoose = require('mongoose');
const subscriptionSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'user id is required'],
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'admin id is required'],
    },
    subscription:{
        type:String,
        required:[true , 'subscription missing']
    },
    gst:{
        type:Number,
        required:[true, 'gst  missing']
    },
    amount:{
        type:Number,
        required:[true, 'amount missing']
    },
    duedate:{
        type:String,
        required:[true ,'due date missing']
    }
})

const subscriptionModel = new mongoose.model('subscription',subscriptionSchema);
module.exports = subscriptionModel;