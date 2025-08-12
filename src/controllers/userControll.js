const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const DriUser = require("../models/DriUserModel");
const userSavingsModel = require("../models/userSavingsModel");
const otpStore = {};
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("otp", otp);
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Basic validation
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    // Get OTP record
    const record = otpStore[phone];
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    // Convert both to numbers for comparison
    const submittedOtp = Number(otp);
    const storedOtp = Number(record.otp);

    if (storedOtp !== submittedOtp) {
      console.log("Stored OTP:", storedOtp, "Received OTP:", submittedOtp);
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid → Check if user exists
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Failed to verify user.",
        });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.SecretKey,
      { expiresIn: "7d" }
    );

    // Remove OTP from store after successful verification
    delete otpStore[phone];

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.userController = async (req, res, next) => {
  try {
    const { user_id } = req;
    if (!user_id) {
      return res
        .status(404)
        .json({ success: false, message: "user id missing" });
    }
    const userData = await User.findOne({ _id: user_id });
    console.log(userData);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    return res.status(200).json({ success: true, userData });
  } catch (err) {
    console.log(err.message);
  }
};

//  create user

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "invalid request" });
    }
    if (!name || !email || !phone) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ name, email, phone });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Created" });
    }
    return res
      .status(201)
      .json({ success: true, message: "User Created Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { id } = req.query;
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "invalid user" });
    }
    const updateFields = {
      name,
      email,
      phone,
    };
    const user = await User.updateOne({ _id: id }, updateFields, { new: true });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "faild to update" });
    }

    return res.status(200).json({ success: true, message: "update success" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// user login ny phone and otp

//
exports.InsertUser = async (req, res, next) => {
  try {
    // const {name, email,gender,}
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// insert saving by user
exports.userSaving = async (req, res, next) => {
  try {
    // Get user_id from proper place
    const user_id = req.user?.id || req.params.user_id || req.body.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "unauthorized user",
      });
    }

    console.log("user_id:", user_id);

    const { month, year, amount } = req.body;
    const requiredFields = { month, year, amount };
    const missingFields = [];

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null || value === "") {
        missingFields.push(key);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        errors: missingFields,
      });
    }

    const saving = await userSavingsModel.create({
      user_id,
      month,
      year,
      amount,
    });

    return res.json(saving);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// get savings by user
exports.getSavingByMonthYear = async (req, res) => {
  try {
    const user_id =
      req.user_id ||
      req.params.user_id ||
      req.body.user_id ||
      req.query.user_id;
    if (!user_id) {
      return res.status(404).json({
        success: false,
        message: "invalid user",
      });
    }

    const { month, year } = req.body;
    const requiredFields = { user_id, month, year };
    const missingFields = [];

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null || value === "" || value === "undefined") {
        missingFields.push(key);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(", ")} required`,
        errors: missingFields,
      });
    }

    const payload = {
      user_id,
      month: month.trim(),
      year: parseInt(year),
    };

    const savings = await userSavingsModel.find(payload);

    if (savings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No savings found for this month and year",
      });
    }

    return res.status(200).json({
      success: true,
      data: savings,
    });
  } catch (err) {
    console.error("Error fetching savings:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
