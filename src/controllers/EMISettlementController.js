const EmiModel = require("../models/EMIModel");
const DrisModel = require("../models/DriUserModel");
const fs = require("fs");
const excelModel = require("../models/excelModel");
const csv = require("csvtojson");
exports.EMISettlement = async (req, res) => {
  try {
    const data = [];
    const result = await csv().fromFile(req.file.path);

    result.forEach((element) => {
      data.push({
        name: element?.Person || element?.person || "",
        phone: element?.Phone || element?.phone || "",
        credit_Cards: element?.CreditCard || element?.creditcard || "",
        credit_Amount: element?.CreditAmount || element?.creditamount || "",
        credit_Total: element?.CCTotal || element?.cctotal || "",
        personal_Loan: element?.PersonalLoan || element?.personalloan || "",
        PL_Amount: element?.TotalAmount || element?.totalamount || "",
        PL_Total: element?.PLTotal || element?.pltotal || "",
        Service_Fees: element?.ServiceTotal || element?.servicetotal || "",
        Service_Advance_Total:
          element?.AdvanceTotal || element?.advancetotal || "",
        Final_Settlement:
          element?.FinalSettlement || element?.finalsettlement || "",
        Settlement_Percent:
          element?.SettlementPercent || element?.settlementpercent || "",
        totalEMI: element?.TotalEMI || element?.totalemi || "",
        monthlyEmi: element?.MonthlyEmi || element?.monthlyEmi,
      });
    });

    const output = {
      name: "",
      phone: "",
      credit_Cards: [],
      credit_Amount: [],
      personal_Loan: [],
      CreditTotal: "",
      PL_Amount: [],
      PL_Total: "",
      Service_Fees: "",
      Service_Advance_Total: "",
      Final_Settlement: "",
      Settlement_Percent: "",
      totalEmi: "",
      monthlyEmi: "",
    };

    data.forEach((entry) => {
      if (entry.totalEMI) output.totalEmi = entry.totalEMI;
      if (entry.name) output.name = entry.name;
      if (entry.phone) output.phone = entry.phone;

      if (entry.credit_Cards) {
        output.credit_Cards.push(entry.credit_Cards);
        output.credit_Amount.push(entry.credit_Amount || "");
      }

      if (entry.credit_Total) {
        output.CreditTotal = entry.credit_Total;
      }

      if (entry.personal_Loan) {
        output.personal_Loan.push(entry.personal_Loan);
        output.PL_Amount.push(entry.PL_Amount || "");
      }

      if (entry.PL_Total && !output.PL_Total) {
        output.PL_Total = entry.PL_Total;
      }

      if (entry.Service_Fees && !output.Service_Fees) {
        output.Service_Fees = entry.Service_Fees;
      }

      if (entry.Service_Advance_Total && !output.Service_Advance_Total) {
        output.Service_Advance_Total = entry.Service_Advance_Total;
      }

      if (entry.Final_Settlement && !output.Final_Settlement) {
        output.Final_Settlement = entry.Final_Settlement;
      }

      if (entry.Settlement_Percent && !output.Settlement_Percent) {
        output.Settlement_Percent = entry.Settlement_Percent;
      }
      if (entry.monthlyEmi && !output.monthlyEmi) {
        output.monthlyEmi = entry.monthlyEmi;
      }
    });
    fs.unlinkSync(req.file.path); // delete temp CSV
    const userPhone = output.phone;
    delete output.name;
    delete output.email;

    const isUser = await DrisModel.findOne({ phone: userPhone });

    if (isUser) {
      // Option 1: Update and save
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
    return res
      .status(500)
      .send({ message: "Server Error", error: err.message });
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
