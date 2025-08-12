const adminModel = require("../../models/adminModel");
const advocateModel = require("../../models/advocateModel");
const cloudinay = require('../../utilitis/cloudinary');
const fs = require('fs');
exports.addAdvocate = async (req, res, next) => {
    try {
        const imagePath = req.file.path;

        const { name, whatsappNumber, contactNumber } = req.body;
        if (!name || !whatsappNumber || !contactNumber || !imagePath) return res.status(400).json({ success: false, message: "Please fill all fields" });
        const payload = { name, whatsappNumber, contactNumber }
        const advocate = await advocateModel.findOne({ contactNumber });
        if (advocate) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Advocate already exists"
                })
        }
        const profileImage = await cloudinay.uploader.upload(imagePath, {
            folder: "AdvacteImages"
        })
        fs.unlinkSync(imagePath);
        payload.advocateImage = profileImage.secure_url;
        payload.imagePublicKey = profileImage.public_id;
        const createAdvocate = await advocateModel.create(payload);
        if (!createAdvocate) return res.status(400).json({ success: false, message: "failed to add" })
        return res.status(200).json({ success: true, message: "added successfully" })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}

// update timing
exports.updateAdvocate = async (req, res, next) => {
    try {
        const { admin_id } = req;
        const imagePath = req.file;
        const { name, whatsapp, contact } = req.body;
        if (!admin_id) return res.status(401).json({ message: "Unauthorized" });
        if (!name || !whatsapp || !contact) return res.status(
            400).json({ success: false, message: "Please fill all fields" });
        const payload = { name, whatsappNumber: whatsapp, contactNumber: contact, }
        const isAdvocate = await advocateModel.findOne({ contactNumber: contact });
        if (!isAdvocate) return res.status(400).json({ success: false, message: "advocate not found" });
        if (imagePath) {
            //delete exist image
            const existImage = await cloudinay.uploader.destroy(isAdvocate.imagePublicKey);
            if (existImage.result = 'ok') {
                const profileImage = await cloudinay.uploader.upload(imagePath.path, {
                    folder: "Advacte Images",
                    public: isAdvocate.imagePublicKey,
                    overwrite: true
                })
                fs.unlinkSync(imagePath.path);
                payload.advocateImage = profileImage.secure_url;
                payload.imagePublicKey = profileImage.public_id
                await isAdvocate.updateOne(payload)
                isAdvocate.save()
                return res.status(201)
                    .json({ success: true, message: "Profile Update.." })
            }
        }
        await isAdvocate.updateOne(payload)
        isAdvocate.save();
        return res.status(201)
            .json({ success: true, message: "Profile Update.." })
    } catch (err) {
        return res.status(500).json({ message: err.message, success: false })
    }
}

// single advocate profile get
exports.getSingleAdvocate = async (req, res, next) => {
    try {
        const { admin_id } = req;
        const { id } = req.params;
        if (!admin_id) return res.status(401).json({ message: "Unauthorized" });
        const advocate = await advocateModel.findById(id);
        if (!advocate) return res.status(404).json({ success: false, message: "failed to fetch" });
        return res.status(200).json({ success: true, data: advocate });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false })
    }
}



// get all advocates
exports.getAllAdvocates = async (req, res, next) => { 
    try {
        const advocates = await advocateModel.find({});
        if (!advocates) {
            return res.status(404).json({ success: false, message: "No advocates found" });
        }
        return res.status(200).json({ success: true, data: advocates });
    }
    catch (error) {
        return res.status(500)
            .json({ message: error.message, success: false })
    }
}