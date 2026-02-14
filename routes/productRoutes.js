const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const auth = require("../middleware/authMiddleware")

// ================= MULTER SETUP =================
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

const upload = multer({
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

		const product = new Product({
			name,
			description,
			price,
			image: req.file ? req.file.filename : null,
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
			if (product.image) {
				const oldPath = `uploads/${product.image}`
				if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
			}
			product.image = req.file.filename
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

		if (product.image) {
			const imagePath = `uploads/${product.image}`
			if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
		}

		await Product.findByIdAndDelete(req.params.id)

		res.json({ message: "Deleted successfully" })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
