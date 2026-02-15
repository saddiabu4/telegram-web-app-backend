const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const path = require("path")
const auth = require("../middleware/authMiddleware")

// Cloudinary yoki local storage
let upload
if (process.env.CLOUDINARY_CLOUD_NAME) {
	// Cloudinary ishlatish (production uchun)
	const { upload: cloudinaryUpload } = require("../config/cloudinary")
	upload = cloudinaryUpload
} else {
	// Local storage (development uchun)
	const multer = require("multer")
	const fs = require("fs")
	
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadPath = "uploads/"
			if (!fs.existsSync(uploadPath)) {
				fs.mkdirSync(uploadPath)
			}
			cb(null, uploadPath)
		},
		filename: (req, file, cb) => {
			cb(null, Date.now() + path.extname(file.originalname))
		},
	})

	upload = multer({
		storage,
		limits: { fileSize: 5 * 1024 * 1024 },
		fileFilter: (req, file, cb) => {
			const allowedTypes = /jpeg|jpg|png|webp/
			const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase())
			const mime = allowedTypes.test(file.mimetype)

			if (ext && mime) cb(null, true)
			else cb(new Error("Only images are allowed"))
		},
	})
}

// ================= GET ALL =================
router.get("/", async (req, res) => {
	try {
		const products = await Product.find().sort({ createdAt: -1 })
		res.json(products)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// ================= GET ONE =================
router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) return res.status(404).json({ message: "Not found" })
		res.json(product)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// ================= CREATE =================
router.post("/", auth, upload.single("image"), async (req, res) => {
	try {
		const { name, description, price } = req.body

		if (!name || !price)
			return res.status(400).json({ message: "Name and price required" })

		// Cloudinary path yoki local filename
		let imagePath = null
		if (req.file) {
			imagePath = req.file.path || req.file.filename
		}

		const product = new Product({
			name,
			description,
			price,
			image: imagePath,
		})

		await product.save()
		res.status(201).json(product)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// ================= UPDATE =================
router.put("/:id", auth, upload.single("image"), async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) return res.status(404).json({ message: "Product not found" })

		if (req.file) {
			// Eski rasmni o'chirish (faqat Cloudinary uchun)
			if (product.image && process.env.CLOUDINARY_CLOUD_NAME) {
				const { cloudinary } = require("../config/cloudinary")
				// Cloudinary public_id olish
				const publicId = product.image.split("/").slice(-2).join("/").split(".")[0]
				try {
					await cloudinary.uploader.destroy(publicId)
				} catch (err) {
					console.error("Cloudinary delete error:", err.message)
				}
			}
			// Yangi rasm
			product.image = req.file.path || req.file.filename
		}

		product.name = req.body.name || product.name
		product.description = req.body.description || product.description
		product.price = req.body.price || product.price

		await product.save()
		res.json(product)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// ================= DELETE =================
router.delete("/:id", auth, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) return res.status(404).json({ message: "Product not found" })

		// Rasmni o'chirish
		if (product.image && process.env.CLOUDINARY_CLOUD_NAME) {
			const { cloudinary } = require("../config/cloudinary")
			const publicId = product.image.split("/").slice(-2).join("/").split(".")[0]
			try {
				await cloudinary.uploader.destroy(publicId)
			} catch (err) {
				console.error("Cloudinary delete error:", err.message)
			}
		}

		await Product.findByIdAndDelete(req.params.id)

		res.json({ message: "Deleted successfully" })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
