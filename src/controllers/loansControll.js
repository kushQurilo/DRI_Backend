const mongoose = require("mongoose");
const personalLoanModel = require("../models/personalLoan");


exports.createPersonalLoan = async (req, res) => {
    try {
        const { userId, bankName, principle, estimatedSettlement, estimatedSaves, loanType } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId" });
        }

        const loan = await personalLoanModel.create({
            userId,
            bankName,
            principle,
            estimatedSettlement,
            estimatedSaves,
            loanType
        });
        return res.status(201).json({ success: true, data: loan });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Get all loans for a user.
exports.getPersonalLoan = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const personalloan = await personalLoanModel.find({ userId: id }).select('-userId -_id');
        if (personalloan.length === 0) {
            return res.status(404).json({ success: false, message: "No personal loans found" });
        }
        return res.status(201)
            .json({ success: true, data: personalloan });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getLoanById = async (req, res) => {
    try {
        const { loanId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(400).json({ success: false, message: "Invalid loan ID" });
        }
        const loan = await personalLoanModel.findById(loanId);
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        return res.status(200).json({ success: true, data: loan });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(400).json({ success: false, message: "Invalid loan ID" });
        }
        const loan = await personalLoanModel.findByIdAndUpdate(loanId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        return res.status(200).json({ success: true, data: loan });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(400).json({ success: false, message: "Invalid loan ID" });
        }
        const loan = await personalLoanModel.findByIdAndDelete(loanId);
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        return res.status(200).json({ success: true, message: "Loan deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
