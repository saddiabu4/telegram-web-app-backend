const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// ================= REGISTER (faqat bir marta ishlatamiz) =================
router.post("/register", async (req, res) => {
	try {
		const { email, password } = req.body

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = new User({
			email,
			password: hashedPassword,
		})

		await user.save()

		res.json({ message: "Admin created successfully" })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// ================= LOGIN =================
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await User.findOne({ email })
		if (!user) {
			return res.status(400).json({ message: "User not found" })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ message: "Wrong password" })
		}

		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		)

		res.json({ token })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
