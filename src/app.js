require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const telegramBot = require("../bot/telegramBot")

const app = express()

// ================= SECURITY MIDDLEWARE =================
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
)

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: { error: "Too many requests, please try again later." },
})
app.use("/api/", limiter)

// ================= CORS =================
const corsOptions = {
	origin: [
		process.env.CLIENT_URL || "http://localhost:5173",
		"https://telegram-web-app-frontend.vercel.app",
	],
	// fjalsjdfl;asjdlfj
	credentials: true,
	optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ================= ROUTES =================
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)

app.get("/", (req, res) => {
	res.send("🚀 Cosmetic MiniApp API is running...")
})

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({
		error:
			process.env.NODE_ENV === "development" ? err.message : "Server error",
	})
})

// ================= DATABASE =================
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log("✅ MongoDB connected")
		// Initialize Telegram Bot after DB connection
		telegramBot.launch()
		console.log("🤖 Telegram Bot started")
	})
	.catch((err) => {
		console.error("❌ MongoDB connection error:", err.message)
		process.exit(1)
	})

// ================= SERVER =================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
	console.log(`🔥 Server running on port ${PORT}`)
})

// Graceful shutdown
process.once("SIGINT", () => telegramBot.stop("SIGINT"))
process.once("SIGTERM", () => telegramBot.stop("SIGTERM"))
