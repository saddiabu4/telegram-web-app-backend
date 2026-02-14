# 🛍 Cosmetic Shop - Telegram Mini App

Telegram Mini App orqali kosmetika mahsulotlarini sotish uchun to'liq funksional do'kon.

## ✨ Xususiyatlar

### 🤖 Telegram Bot

- `/start` - Botni ishga tushirish va xush kelibsiz xabari
- `/shop` - Mini App do'konni ochish
- `/products` - Mahsulotlar ro'yxatini ko'rish
- `/help` - Yordam

### 🛒 Mini App (Frontend)

- Zamonaviy UI/UX dizayn
- GSAP animatsiyalari
- Responsive dizayn (mobil va desktop)
- Savat tizimi
- Telegram WebApp integratsiyasi

### 🔧 Admin Panel

- Mahsulotlar boshqaruvi (CRUD)
- Rasm yuklash
- JWT autentifikatsiya
- Himoyalangan routelar

### 🔒 Backend

- Express.js REST API
- MongoDB ma'lumotlar bazasi
- JWT token autentifikatsiya
- Multer orqali fayl yuklash
- Rate limiting va Helmet xavfsizlik
- CORS sozlamalari

## 🚀 O'rnatish

### 1. Backend sozlash

```bash
cd "telegram web bot"
npm install
```

`.env` faylini yarating:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
BOT_TOKEN=your_telegram_bot_token
WEBAPP_URL=https://your-deployed-domain.com
CLIENT_URL=http://localhost:5173
```

### 2. Frontend sozlash

```bash
cd client
npm install
```

`client/.env` faylini yarating:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

### 3. Ishga tushirish

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## 📱 Telegram Bot sozlash

1. [@BotFather](https://t.me/BotFather) orqali bot yarating
2. Bot tokenini `.env` fayliga qo'shing
3. BotFather da `/setmenubutton` buyrug'ini yuboring
4. Mini App URLini kiriting (deploy qilingan URL)

## 🌐 Deploy qilish

### Backend (Render, Railway, yoki VPS)

1. GitHub ga push qiling
2. Render/Railway da yangi Web Service yarating
3. Environment o'zgaruvchilarini sozlang
4. Deploy qiling

### Frontend (Vercel, Netlify)

1. `npm run build` orqali build qiling
2. Vercel/Netlify ga deploy qiling
3. `.env` faylidagi URLlarni yangilang

## 📁 Loyiha strukturasi

```
telegram-web-bot/
├── app.js              # Asosiy server fayli
├── package.json        # Backend dependencies
├── .env                # Environment o'zgaruvchilari
├── bot/
│   └── telegramBot.js  # Telegram bot logikasi
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── productRoutes.js
├── uploads/            # Yuklangan rasmlar
└── client/             # React frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Shop.jsx
    │   │   ├── Admin.jsx
    │   │   └── Login.jsx
    │   ├── components/
    │   └── config/
    └── package.json
```

## 🛠 Texnologiyalar

**Backend:**

- Node.js & Express.js
- MongoDB & Mongoose
- Telegraf (Telegram Bot)
- JWT Authentication
- Multer (File Upload)
- Helmet & Rate Limit

**Frontend:**

- React 19
- Vite
- Tailwind CSS
- GSAP Animations
- Axios
- React Router DOM
- Lucide Icons
- React Hot Toast

## 📞 Aloqa

Savollar bo'lsa, murojaat qiling!

## 📄 Litsenziya

MIT License
