const mongoose = require("mongoose");
const personalLoanSchema = mongoose.Schema({
  phone: {
    type: Number,
    required: [true, "phone number required"],
  },
  bankName: {
    type: String,
    required: [true, "bank required"],
  },
  principleAmount: {
    type: Number,
    required: true,
  },
  estimatedSettlement: {
    type: Number,
    required: true,
  },
  saving: {
    type: Number,
    required: true,
  },
  loanType: {
    type: String,
    required: true,
  },
});
const personalLoanModel = new mongoose.model(
  "personalloans",
  personalLoanSchema
);
module.exports = personalLoanModel;
