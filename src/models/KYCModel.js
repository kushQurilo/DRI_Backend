const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "user missing"],
    ref: "user",
  },
  id: {
    type: String,
  },
  image: {
    type: String,
    required: [true, "image missing"],
  },
  name: {
    type: String,
    required: [true, "name required"],
  },
  lastname: {
    type: String,
  },
  aadhar: {
    type: String,
    required: [true, "Aadhar required"],
  },
  pan: {
    type: String,
    required: [true, "Pan Card required"],
  },
  backAdhar: {
    type: String,
    required: [true, "Aadhar required"],
  },
  status: {
    type: String,
    default: "pending",
  },
  date: {
    type: String,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  email: {
    type: String,
    required: [true, "email missing"],
    unique: true,
  },
  gender: {
    type: String,
    required: [true, "gender require"],
  },
  assign_advocate: {
    type: String,
    ref: "advocate",
  },
});

const KYCmodel = mongoose.model("kyc", kycSchema);
module.exports = KYCmodel;
