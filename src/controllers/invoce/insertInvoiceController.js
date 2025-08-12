const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
// const InvoiceModel = require('../models/Invoice');
const cloudinary = require('../../utilitis/cloudinary');
const superbase = require('../../config/superbase storage/superbaseConfig');
const InvoiceModel = require('../../models/InvoiceModel');
const { default: mongoose } = require('mongoose');

exports.viewInvoice = async (req, res, next) => {
    try {
        const secure_url = req.params.id;
        return res.redirect(secure_url)
    }
    catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
}
exports.downloadInvoice = async (req, res, next) => {

}


// test
exports.uploadInvoice = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Upload PDF to Supabase
        const filePath = file.path;
        const fileName = `pdfs/${Date.now()}_${file.originalname}`;
        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await superbase
            .storage
            .from('invoices')
            .upload(fileName, fileBuffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (error) {
            throw new Error("Failed to upload PDF to Supabase: " + error.message);
        }

        const { data: publicUrlData } = superbase
            .storage
            .from('invoices')
            .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;


        const buffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(buffer);
        const text = pdfData.text;


        const extract = (pattern) => {
            const match = text.match(pattern);
            return match ? match[1].trim() : "";
        };

        const invoiceData = {
            invoiceDate: extract(/Invoice Date\s+([\d\/]+)/i),
            serviceName: extract(/Monthly Subscription Fees\s*\n*\(([^)]+)\)/i)
                ? `Monthly Subscription Fees (${extract(/Monthly Subscription Fees\s*\n*\(([^)]+)\)/i)})`
                : "Monthly Subscription Fees",
            totalAmount: extract(/Total Amount\s+₹?\s*([\d,]+)/i),
            url: publicUrl,
            user_id
        };
        fs.unlinkSync(filePath);
        const result = await InvoiceModel.create(invoiceData);
        if (!result) {
            return res.status(500).json({ message: "Failed to upload invoice" });
        }
        return res.status(200).json({
            message: "PDF uploaded",
            success: true
        });

    } catch (err) {
        console.error("Error processing invoice:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// get all invoices for user
exports.getInvoices = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ message: "User required" });
        }
        const result = await InvoiceModel.find({ user_id });
        if (!result) {
            return res.status(404).json({ message: "No invoices found" });
        }
        return res.status(200).json({ success: true, result });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// get invoice by date
exports.getInvoicesByMonthYear = async (req, res) => {
    try {
        const { month, year, id } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and year required" });
        }
        const isId = mongoose.Types.ObjectId.isValid(id)
        if(!isId){
            return res.status(400)
            .json({success:false,message:"Invalid id"})
        }
        const formattedMonth = month.padStart(2, '0');
        const regex = new RegExp(`/${formattedMonth}/${year}$`);

        const invoices = await InvoiceModel.find(
            {
                user_id: id,
                invoiceDate: {
                    $regex: regex
                }
            });
        if(invoices.length ===0){
            return res.status(404)
            .json({message:"no invoice found",success:false})
        }
        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
