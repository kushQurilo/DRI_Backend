const UPIModel = require("../models/UPIModel");
const cloudinary = require("../utilitis/cloudinary");
const fs = require('fs');
exports.createUPI = async (req, res, next) => {
    try {
        const { upi_id } = req.body;
        const filePath = req.file?.path;
        // console.log({ upi_id, filePath })
        if (!upi_id || !filePath) {
            return res.status(400).json({ message: "Credentials missing" });
        }
        const existingUPI = await UPIModel.findOne();
        // console.log('sss',existingUPI);
        if (existingUPI.length !== 0) {
            return res.status(200).json({
                success: true,
                message: "UPI and QR Code already added"
            });
        }
        const qr = await cloudinary.uploader.upload(filePath, {
            folder: "DRI_QR_CODE"
        });
        const payload = {
            upi_id,
            qrCode: qr.secure_url,
            qrCodePublic_key: qr.public_id
        };
        const newUPI = await UPIModel.create(payload);
        return res.status(201).json({
            success: true,
            message: "UPI and QR Code added successfully",
            data: newUPI
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, error });
    }
};

//get upi
exports.getUPI = async (req, res, next) => {
    try {
        const upi = await UPIModel.find();
        if (!upi) {
            return res.status(404).json({ message: "No UPI found" });
        }
        return res.status(200).json({ success: true, data: upi });
    } catch (error) {
        return res.status(500).json({ message: error.message, error });
    }
}

// delete UPI
exports.deleteUPI = async (req, res, next) => {
    try {
        const upi_id = req.params.id;
        const find = await UPIModel.findById(upi_id);
        if (!find) {
            return res.status(404).json({ message: "No UPI found" });
        }
        await cloudinary.uploader.destroy(find.qrCodePublic_key);
        await find.deleteOne()
        return res.status(200).json({ success: true, message: "UPI deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message, error });
    }
}