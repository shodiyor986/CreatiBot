# ============================================
# BotForge - Barcha sozlamalar
# ============================================

# Asosiy bot token (BotFather dan olingan)
MAIN_BOT_TOKEN = "8717279627:AAFV9R4nrVx2r5IyMv_hSozxCYw8ushWvNo"

# Admin Telegram ID lari (o'zingizning ID ingizni qo'ying)
ADMIN_IDS = [123456789]  # O'zingizning Telegram ID ingiz

# WebApp URL (Render.com yoki ngrok dan olingan URL)
WEBAPP_URL = "https://your-botforge.onrender.com"

# ============================================
# SheetDB API
# ============================================
SHEETDB_URL = "https://sheetdb.io/api/v1/53jj6rji62pdg"

# ============================================
# Google Sheets
# ============================================
GOOGLE_SHEET_ID = "1sAElOzcFFlfGAY3RNhjzYZnfGTCb8BNnWs35sC3Firo"
GOOGLE_CREDENTIALS_FILE = "credentials.json"  # Service account JSON fayli

# ============================================
# ImgBB API (rasmlar uchun)
# ============================================
IMGBB_API_KEY = "99f8a9de82db58dc79c164cea4551235"
IMGBB_URL = "https://api.imgbb.com/1/upload"

# ============================================
# Paystack (karta to'lovi)
# ============================================
PAYSTACK_SECRET_KEY = "sk_live_YOUR_PAYSTACK_SECRET_KEY"
PAYSTACK_PUBLIC_KEY = "pk_live_YOUR_PAYSTACK_PUBLIC_KEY"
PAYSTACK_BASE_URL = "https://api.paystack.co"

# ============================================
# USDT TRC20 to'lov
# ============================================
USDT_WALLET = "TYour_TRC20_Wallet_Address_Here"
USDT_NETWORK = "TRC20"

# ============================================
# Narxlar va limitlar
# ============================================
PREMIUM_PRICE_USD = 15
PREMIUM_DAYS = 30
FREE_BOT_LIMIT = 1
PREMIUM_BOT_LIMIT = 10

# ============================================
# Kanal/Guruh sozlamalari
# ============================================
BOT_TYPES = {
    "button": "Tugmali bot",
    "message": "Xabar yuboruvchi bot",
    "webapp": "Web App bot"
}

# ============================================
# Xabarlar (o'zbek tilida)
# ============================================
MESSAGES = {
    "welcome": """
🤖 <b>BotForge ga xush kelibsiz!</b>

Hech qanday dasturlash bilimisiz o'z Telegram botingizni yarating!

✨ <b>Imkoniyatlar:</b>
• Vizual bloklar bilan bot yaratish
• Kanal va guruhlarni boshqarish
• Avtomatik xabar yuborish
• Premium: 10 tagacha bot

👇 Quyidagi tugmalardan birini tanlang:
""",
    "not_premium": "❌ Bu funksiya faqat <b>Premium</b> foydalanuvchilar uchun!\n\n💎 /subscribe buyrug'i orqali obuna oling.",
    "bot_limit_free": "❌ Siz allaqachon 1 ta bot yaratgansiz!\n\nKo'proq bot yaratish uchun <b>Premium</b> oling: /subscribe",
    "bot_limit_premium": "❌ Siz 10 ta bot yaratganisz (maksimal limit)!",
    "payment_pending": "⏳ To'lovingiz tekshirilmoqda...\n\nAdmin tasdiqlashini kuting. Odatda 5-30 daqiqa ketadi.",
}
