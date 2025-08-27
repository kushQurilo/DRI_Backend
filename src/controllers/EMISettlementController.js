const EmiModel = require("../models/EMIModel");
const DrisModel = require("../models/DriUserModel");
const fs = require("fs");
const csv = require("csvtojson");

exports.EMISettlement = async (req, res) => {
  try {
    const { phone: requestPhone } = req.body;
    const csvfilepath = req.file.path;
    if (!requestPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
    if (requestPhone.length > 10) {
      return res
        .status(400)
        .json({ success: false, message: "phone number must me 10 digit" });
    }
    const rawRows = await csv().fromFile(req.file.path);

    let lastPhone = "";
    let lastName = "";

    // Fill missing Person & Phone values
    const normalizedData = rawRows.map((row) => {
      if (row.Phone && row.Phone.trim()) lastPhone = row.Phone.trim();
      if (row.Person && row.Person.trim()) lastName = row.Person.trim();

      return {
        ...row,
        Phone: row.Phone && row.Phone.trim() ? row.Phone.trim() : lastPhone,
        Person: row.Person && row.Person.trim() ? row.Person.trim() : lastName,
      };
    });

    // Filter only this phone number
    const filteredRows = normalizedData.filter((row) => {
      return String(row.Phone).trim() === String(requestPhone).trim();
    });
    if (filteredRows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User Not Found In This Nunber..",
      });
    }

    // Build grouped output
    const output = {
      phone: requestPhone,
      credit_Cards: [],
      credit_Amount: [],
      personal_Loan: [],
      PL_Amount: [],
      CreditTotal: "",
      PL_Total: "",
      Service_Fees: "",
      Service_Advance_Total: "",
      Final_Settlement: "",
      Settlement_Percent: "",
      totalEmi: "",
      monthlyEmi: "",
      status: "penidng",
    };

    filteredRows.forEach((entry) => {
      if (entry.CreditCard) {
        output.credit_Cards.push(entry.CreditCard);
        output.credit_Amount.push(entry.CreditAmc || entry.CreditAmount || "");
      }

      if (entry.CCTotal) output.CreditTotal = entry.CCTotal;

      // Loan details
      if (entry.PersonalLoan) {
        output.personal_Loan.push(entry.PersonalLoan);
        output.PL_Amount.push(entry.TotalAmount || "");
      }

      if (entry.PLTotal) output.PL_Total = entry.PLTotal;
      if (entry.ServiceTotal) output.Service_Fees = entry.ServiceTotal;
      if (entry.AdvanceTotal) output.Service_Advance_Total = entry.AdvanceTotal;
      if (entry.FinalSettlement)
        output.Final_Settlement = entry.FinalSettlement;
      if (entry.SettlementPercent)
        output.Settlement_Percent = entry.SettlementPercent;
      if (entry.TotalEMI) output.totalEmi = entry.TotalEMI;
      if (entry.MonthlyEmi) output.monthlyEmi = entry.MonthlyEmi;
    });

    fs.unlinkSync(csvfilepath);
    console.log("dta", output);
    const isUser = await DrisModel.findOne({ phone: requestPhone });
    if (isUser) {
      Object.assign(isUser, output);
      await isUser.save();

      return res.status(201).json({
        success: true,
        message: "EMI Upload successfully",
      });
    }

    return res.json({
      success: false,
      message: "Invalid User",
    });
  } catch (err) {
    console.error("Error processing EMI:", err);
    return res.status(500).send({
      message: "Server Error",
      error: err.message,
    });
  }
};

exports.EMIPayment = async (req, res, next) => {
  try {
    const { user_id, loanId, emiId } = req.body;
    if (!user_id || !loanId || !emiId) {
      return res.status(400).json({ message: "Requirement Missing" });
    }
    const isEMIexist = await EmiModel.findOne({
      userId: user_id,
      loanId: loan,
    });
    if (isEMIexist.paidEmis === isEMIexist.numberOfEmI) {
      return res.status(200).json({ success: true, message: "No EMI to pay" });
    }
    isEMIexist.paidEmis + 1;
    await isEMIexist.save();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.deleteEmis = async (req, res, next) => {
  try {
    const { user_id, emiId } = req.body;
    if (!user_id || !emiId) {
      return res.status(400).json({ message: "Requirement Missing" });
    }
    const isEMIexist = await EmiModel.findOne({ userId: user_id, _id: emiId });
    if (!isEMIexist) {
      return res.status(400).json({ message: "EMI not found" });
    }
    await isEMIexist.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "EMI deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong.", error: err.message });
  }
};

exports.getAllEmiByUser = async (req, res, next) => {
  try {
    const emidata = await EmiModel.find({}).populate("phone");
    return res.status(200).json({ success: true, data: emidata });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

exports.ManualEmiUpload = async (req, res, next) => {
  try {
    const {
      phone,
      principalAmount,
      estimatedSettlement,
      loanType,
      monthlyEmi,
      emiType,
      noOfEmi,
      dueDate,
    } = req.body;
    if (!phone || phone.length !== 10) {
      return res.status(200).json({
        success: false,
        message: "Phone number is required and must be exactly 10 digits",
      });
    }
    const isUser = await DrisModel.findOne({ phone });
    if (!isUser) {
      return res
        .status(400)
        .json({ success: false, message: "user not found at this number" });
    }
    if (emiType === "Settelement Advance") {
      isUser.Service_Advance_Total = principalAmount;
    }
    if (emiType === "Service Fees") {
      isUser.Service_Fees = principalAmount;
    }
    isUser.PL_Total = principalAmount;
    isUser.totalEmi = noOfEmi;
    isUser.dueDate = dueDate;
    await isUser.save();
    return res.status(201).json({
      success: true,
      message: "emi uploded",
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ success: false, message: error.message, error });
  }
};

//  advance settelement
exports.EMISettlement = async (req, res) => {
  try {
    const { phone: requestPhone } = req.body;
    const csvfilepath = req.file.path;
    if (!requestPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
    if (requestPhone.length > 10) {
      return res
        .status(400)
        .json({ success: false, message: "phone number must me 10 digit" });
    }
    const rawRows = await csv().fromFile(req.file.path);

    let lastPhone = "";
    let lastName = "";

    // Fill missing Person & Phone values
    const normalizedData = rawRows.map((row) => {
      if (row.Phone && row.Phone.trim()) lastPhone = row.Phone.trim();
      if (row.Person && row.Person.trim()) lastName = row.Person.trim();

      return {
        ...row,
        Phone: row.Phone && row.Phone.trim() ? row.Phone.trim() : lastPhone,
        Person: row.Person && row.Person.trim() ? row.Person.trim() : lastName,
      };
    });

    // Filter only this phone number
    const filteredRows = normalizedData.filter((row) => {
      return String(row.Phone).trim() === String(requestPhone).trim();
    });

    if (filteredRows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User Not Found In This Nunber..",
      });
    }

    // Build grouped output
    const output = {
      phone: requestPhone,
      credit_Cards: [],
      credit_Amount: [],
      personal_Loan: [],
      PL_Amount: [],
      CreditTotal: "",
      PL_Total: "",
      Service_Fees: "",
      Service_Advance_Total: "",
      Final_Settlement: "",
      Settlement_Percent: "",
      totalEmi: "",
      monthlyEmi: "",
    };

    filteredRows.forEach((entry) => {
      if (entry.CreditCard) {
        output.credit_Cards.push(entry.CreditCard);
        output.credit_Amount.push(entry.CreditAmc || entry.CreditAmount || "");
      }

      if (entry.CCTotal) output.CreditTotal = entry.CCTotal;

      // Loan details
      if (entry.PersonalLoan) {
        output.personal_Loan.push(entry.PersonalLoan);
        output.PL_Amount.push(entry.TotalAmount || "");
      }

      if (entry.PLTotal) output.PL_Total = entry.PLTotal;
      if (entry.ServiceTotal) output.Service_Fees = entry.ServiceTotal;
      if (entry.AdvanceTotal) output.Service_Advance_Total = entry.AdvanceTotal;
      if (entry.FinalSettlement)
        output.Final_Settlement = entry.FinalSettlement;
      if (entry.SettlementPercent)
        output.Settlement_Percent = entry.SettlementPercent;
      if (entry.TotalEMI) output.totalEmi = entry.TotalEMI;
      if (entry.MonthlyEmi) output.monthlyEmi = entry.MonthlyEmi;
    });

    fs.unlinkSync(csvfilepath);
    console.log("dta", output);
    const isUser = await DrisModel.findOne({ phone: requestPhone });
    if (isUser) {
      Object.assign(isUser, output);
      await isUser.save();

      return res.status(201).json({
        success: true,
        message: "EMI Upload successfully",
      });
    }
    return res.json({
      success: false,
      message: "Invalid User",
    });
  } catch (err) {
    console.error("Error processing EMI:", err);
    return res.status(500).send({
      message: "Server Error",
      error: err.message,
    });
  }
};

// mark as paid emi
exports.marksAsPaid = async (req, res) => {
  try {
    const { phone } = req.body;
    const { admin_id } = req;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    if (!admin_id) {
      return res.status(400).json({
        success: false,
        message: "Admin credentials missing",
      });
    }

    // 🔹 Find user first
    const user = await DrisModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Check emiPay > 0
    if (user.emiPay === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark paid. EMI payment is 0",
      });
    }

    // 🔹 Update status if emiPay > 0
    user.status = "paid";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Marked as Paid Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err.message,
    });
  }
};
