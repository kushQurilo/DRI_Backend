const EmiModel = require("../models/EMIModel");
const DrisModel = require("../models/DriUserModel");
const fs = require("fs");
const csv = require("csvtojson");

exports.EMISettlement = async (req, res) => {
  try {
    const { phone: requestPhone } = req.body;

    if (!requestPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
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
        message: "No matching user found in CSV",
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
      // Credit card details
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

    fs.unlinkSync(req.file.path); // Delete temp CSV

    console.log("dta", output);
    const isUser = await DrisModel.findOne({ phone: requestPhone });

    if (isUser) {
      Object.assign(isUser, output);
      await isUser.save();

      return res.status(201).json({
        success: true,
        message: "EMI Upload successfully",
        data: output, // Return grouped data for confirmation
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

// delete emi's if no emi's
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
