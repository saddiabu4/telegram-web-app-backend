const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")

// Cloudinary konfiguratsiyasi
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer storage - Cloudinary ga yuklash
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "cosmetic-shop", // Cloudinary'dagi papka nomi
		allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
		transformation: [{ width: 800, height: 800, crop: "limit" }],
	},
})

const upload = multer({ storage: storage })

module.exports = { cloudinary, upload }
