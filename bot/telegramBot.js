const { Telegraf, Markup } = require("telegraf")
const Product = require("../models/Product")

const bot = new Telegraf(process.env.BOT_TOKEN)

// Web App URL - bu yerga deploy qilingan URL yoziladi
const WEBAPP_URL = process.env.WEBAPP_URL || "http://localhost:5173/"

// ================= START COMMAND =================
bot.command("start", async (ctx) => {
	const userName = ctx.from.first_name || "User"

	await ctx.replyWithPhoto(
		{
			url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
		},
		{
			caption:
				`✨ <b>Xush kelibsiz, ${userName}!</b>\n\n` +
				`🛍 <b>Cosmetic Shop</b> - eng yaxshi kosmetika mahsulotlari!\n\n` +
				`📱 Mini App orqali xarid qiling yoki buyruqlardan foydalaning:\n\n` +
				`🔹 /shop - Mini App ochish\n` +
				`🔹 /products - Mahsulotlar ro'yxati\n` +
				`🔹 /help - Yordam`,
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				[Markup.button.webApp("🛒 Do'konni Ochish", `${WEBAPP_URL}/shop`)],
				[Markup.button.callback("📋 Mahsulotlar", "show_products")],
				[Markup.button.callback("ℹ️ Yordam", "help")],
			]),
		}
	)
})

// ================= SHOP COMMAND =================
bot.command("shop", async (ctx) => {
	await ctx.reply(
		"🛍 <b>Cosmetic Shop</b>\n\nQuyidagi tugmani bosib do'konni oching:",
		{
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				[Markup.button.webApp("🛒 Do'konni Ochish", `${WEBAPP_URL}/shop`)],
			]),
		}
	)
})

// ================= PRODUCTS COMMAND =================
bot.command("products", async (ctx) => {
	try {
		const products = await Product.find().limit(10).sort({ createdAt: -1 })

		if (products.length === 0) {
			return ctx.reply("😔 Hozircha mahsulotlar mavjud emas")
		}

		for (const product of products) {
			const caption =
				`🏷 <b>${product.name}</b>\n\n` +
				`📝 ${product.description || "Tavsif yo'q"}\n\n` +
				`💰 <b>Narxi:</b> $${product.price}`

			if (product.image) {
				await ctx.replyWithPhoto(
					{
						url: `${
							process.env.WEBAPP_URL || "http://localhost:5000"
						}/uploads/${product.image}`,
					},
					{
						caption,
						parse_mode: "HTML",
						...Markup.inlineKeyboard([
							[Markup.button.webApp("🛒 Xarid qilish", `${WEBAPP_URL}/shop`)],
						]),
					}
				)
			} else {
				await ctx.reply(caption, {
					parse_mode: "HTML",
					...Markup.inlineKeyboard([
						[Markup.button.webApp("🛒 Xarid qilish", `${WEBAPP_URL}/shop`)],
					]),
				})
			}
		}
	} catch (error) {
		console.error("Products error:", error)
		ctx.reply("❌ Xatolik yuz berdi. Keyinroq urinib ko'ring.")
	}
})

// ================= HELP COMMAND =================
bot.command("help", async (ctx) => {
	await ctx.reply(
		`ℹ️ <b>Yordam</b>\n\n` +
			`🔸 /start - Botni ishga tushirish\n` +
			`🔸 /shop - Mini App do'konni ochish\n` +
			`🔸 /products - Mahsulotlar ro'yxati\n` +
			`🔸 /help - Yordam\n\n` +
			`📞 <b>Aloqa:</b> @admin_username\n` +
			`📧 <b>Email:</b> support@cosmetic.shop`,
		{ parse_mode: "HTML" }
	)
})

// ================= CALLBACK QUERIES =================
bot.action("show_products", async (ctx) => {
	await ctx.answerCbQuery()
	await ctx.deleteMessage()

	try {
		const products = await Product.find().limit(5).sort({ createdAt: -1 })

		if (products.length === 0) {
			return ctx.reply("😔 Hozircha mahsulotlar mavjud emas")
		}

		let message = "📦 <b>Mahsulotlar ro'yxati:</b>\n\n"

		products.forEach((p, i) => {
			message += `${i + 1}. <b>${p.name}</b> - $${p.price}\n`
		})

		await ctx.reply(message, {
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				[Markup.button.webApp("🛒 Do'konni Ochish", `${WEBAPP_URL}/shop`)],
				[Markup.button.callback("🔙 Orqaga", "back_to_menu")],
			]),
		})
	} catch (error) {
		ctx.reply("❌ Xatolik yuz berdi")
	}
})

bot.action("help", async (ctx) => {
	await ctx.answerCbQuery()
	await ctx.deleteMessage()

	await ctx.reply(
		`ℹ️ <b>Yordam</b>\n\n` +
			`🔸 /start - Botni ishga tushirish\n` +
			`🔸 /shop - Mini App do'konni ochish\n` +
			`🔸 /products - Mahsulotlar ro'yxati\n\n` +
			`📞 <b>Aloqa:</b> @admin_username`,
		{
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				[Markup.button.callback("🔙 Orqaga", "back_to_menu")],
			]),
		}
	)
})

bot.action("back_to_menu", async (ctx) => {
	await ctx.answerCbQuery()
	await ctx.deleteMessage()

	const userName = ctx.from.first_name || "User"

	await ctx.reply(
		`✨ <b>Xush kelibsiz, ${userName}!</b>\n\n` + `🛍 Nima qilmoqchisiz?`,
		{
			parse_mode: "HTML",
			...Markup.inlineKeyboard([
				[Markup.button.webApp("🛒 Do'konni Ochish", `${WEBAPP_URL}/shop`)],
				[Markup.button.callback("📋 Mahsulotlar", "show_products")],
				[Markup.button.callback("ℹ️ Yordam", "help")],
			]),
		}
	)
})

// ================= WEB APP DATA HANDLER =================
bot.on("web_app_data", async (ctx) => {
	try {
		const data = JSON.parse(ctx.webAppData.data)

		if (data.action === "checkout") {
			const { items, total } = data

			let orderMessage = `🛒 <b>Yangi buyurtma!</b>\n\n`
			orderMessage += `👤 <b>Mijoz:</b> ${ctx.from.first_name}\n`
			orderMessage += `📱 <b>Username:</b> @${ctx.from.username || "N/A"}\n\n`
			orderMessage += `📦 <b>Mahsulotlar:</b>\n`

			items.forEach((item, i) => {
				orderMessage += `${i + 1}. ${item.name} - $${item.price}\n`
			})

			orderMessage += `\n💰 <b>Jami:</b> $${total}`

			await ctx.reply(orderMessage, { parse_mode: "HTML" })
			await ctx.reply(
				"✅ Buyurtmangiz qabul qilindi!\n\n" +
					"📞 Tez orada operatorimiz siz bilan bog'lanadi.",
				{
					...Markup.inlineKeyboard([
						[
							Markup.button.webApp(
								"🛒 Yana xarid qilish",
								`${WEBAPP_URL}/shop`
							),
						],
					]),
				}
			)
		}
	} catch (error) {
		console.error("Web App Data error:", error)
	}
})

// ================= ERROR HANDLER =================
bot.catch((err, ctx) => {
	console.error("Bot error:", err)
})

module.exports = bot
