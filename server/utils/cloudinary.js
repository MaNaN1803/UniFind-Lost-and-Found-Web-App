const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unifind_uploads',
        allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
