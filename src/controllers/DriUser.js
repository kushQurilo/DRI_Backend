const csv = require("csvtojson");
const DrisModel = require("../models/DriUserModel");
const KYCmodel = require("../models/KYCModel");
const EmiModel = require("../models/EMIModel");
exports.importUsersFromCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const result = await csv().fromFile(req.file.path);
    const data = result.map((row) => ({
      name: row.name,
      email: row.email,
      gender: row.gender,
      id: row.id,
      phone: row.phone,
    }));
    const uplodUserData = await DrisModel.insertMany(data, { ordered: true });
    return res
      .status(200)
      .json({
        success: true,
        message: "Users inserted",
        count: uplodUserData.length,
      });
  } catch (err) {
    console.error("Insertion error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      reason: err?.writeErrors?.[0]?.errmsg || "Unknown error",
    });
  }
};
//get all user list for admin
exports.getUsersList = async (req, res) => {
  try {
    const users = await DrisModel.find({})
      .select("-createdAt -__v") // remove unwanted fields
      .lean();

    const results = await Promise.all(
      users.map(async (user) => {
        // Fetch KYC by phone number
        const kycData = await KYCmodel.findOne({ phone: user.phone })
          .select("-__v")
          .lean();

        // Fetch EMI by phone number
        const emiData = await EmiModel.find({ phone: user.phone })
          .select("-__v")
          .lean();

        return {
          ...user,
          kyc: kycData || null,
          emi: emiData || [],
        };
      })
    );

    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
      reason: err?.writeErrors?.[0]?.errmsg || "Unknown error",
    });
  }
};

// update user details
exports.searchUserById = async (req, res) => {
  try {
    console.log(req.query);
    const search = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID query parameter is required.",
      });
    }

    // Use a case-insensitive regex for partial matching
    const users = await DrisModel.find({
      id: { $regex: search.id, $options: "i" }, // case-insensitive
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching users found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
