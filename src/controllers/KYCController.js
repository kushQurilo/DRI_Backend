const adminModel = require("../models/adminModel");
const advocateModel = require("../models/advocateModel");
const KYCmodel = require("../models/KYCModel");
const User = require("../models/userModel");
const cloudinary = require("../utilitis/cloudinary");
// const fs = require('fs');
const { Readable } = require("stream");
exports.CompleteKYC = async (req, res, next) => {
  try {
    const results = [];
    const { user_id } = req;
    const { name, lastname, email, gender } = req.body;
    // const
    if (!name || !user_id) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    const isUser = await User.findById(user_id);
    if (!isUser) {
      return res.status(400).json({ message: "Invalid User", success: false });
    }

    const isKyc = await KYCmodel.findOne({ user_id });
    if (isKyc) {
      if (isKyc.status === "pending") {
        return res.status(400).json({
          message: "KYC already submitted. Awaiting approval",
          success: false,
        });
      }
      if (isKyc.status === "approve") {
        return res
          .status(200)
          .json({ message: "KYC already approved", success: true });
      }
    }

    // Upload each file buffer directly to Cloudinary
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Kyc Documents" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        Readable.from(fileBuffer).pipe(stream);
      });
    };

    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      results.push(url);
    }

    const payload = {
      image: results[0],
      aadhar: results[1],
      backAdhar: results[2],
      pan: results[3],
      name,
      user_id,
      lastname,
      email,
      gender,
    };
    console.log("kyc doc", payload);
    const uploadKyc = await KYCmodel.create(payload);
    if (!uploadKyc) {
      return res
        .status(400)
        .json({ message: "Failed to upload KYC", success: false });
    }

    return res.status(200).json({
      success: true,
      message:
        "Your documents have been submitted. Admin will approve within 24 hours.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

//approved kyc by admin

exports.ApproveByAdmin = async (req, res) => {
  try {
    const admin_id = req.admin_id;
    const { kycId, assign_id, advocate_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Admin Credentials",
      });
    }

    if (!kycId || !assign_id || !advocate_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const isAdmin = await adminModel.findById(admin_id);
    if (!isAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isKYC = await KYCmodel.findById(kycId);
    if (!isKYC) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    if (isKYC.status === "approve") {
      return res.status(400).json({
        success: false,
        message: "KYC is already approved",
      });
    }

    // ✅ Get user_id from KYC and assign to advocate
    const userId = isKYC.user_id;

    const updatedAdvocate = await advocateModel.findByIdAndUpdate(
      advocate_id,
      { $addToSet: { assignUsers: userId.toString() } }, // prevent duplicates
      { new: true }
    );

    if (!updatedAdvocate) {
      return res.status(404).json({
        success: false,
        message: "Advocate not found or update failed",
      });
    }

    // ✅ Update KYC Status
    const payload = {
      id: assign_id,
      assign_advocate: advocate_id,
      status: "approve",
    };

    const updateKYC = await KYCmodel.findByIdAndUpdate(kycId, payload, {
      new: true,
    });

    if (!updateKYC) {
      return res.status(400).json({
        success: false,
        message: "Failed to approve KYC",
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC approved and advocate assigned",
      data: {
        updatedKYC: updateKYC,
        updatedAdvocate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getAllKycDetails = async (req, res) => {
  try {
    const fetchKYCUsers = await KYCmodel.find({}).populate("user_id");
    if (!fetchKYCUsers || fetchKYCUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No KYC details found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: fetchKYCUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  get single kyc details
exports.getSingleKycDetails = async (req, res, next) => {
  try {
    const { admin_id } = req;
    const { user_id, kycId } = req.query;
    if (!admin_id || !user_id || !kycId) {
      return res.status(404).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const fetchSingleKyc = await KYCmodel.findOne({ user_id, kycId });
    if (!fetchSingleKyc) {
      return res.status(404).json({
        success: false,
        message: "No KYC details found for the user",
      });
    }
    return res.status(200).json({
      success: true,
      data: fetchSingleKyc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
