from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sheet_manager import SheetManager
from config import SUBSCRIPTION_PRICE, USDT_WALLET, ADMIN_IDS

sheet_manager = SheetManager()

async def cmd_subscribe(message: types.Message):
    """Obuna olish"""
    user = sheet_manager.get_user(message.from_user.id)
    
    keyboard = InlineKeyboardMarkup(row_width=2)
    keyboard.add(
        InlineKeyboardButton("💳 Paystack (Karta)", callback_data="pay_paystack"),
        InlineKeyboardButton("₿ USDT (TRC20)", callback_data="pay_usdt")
    )
    
    status_text = ""
    if user and user.get('is_premium') == "TRUE":
        until = user.get('premium_until', 'Noma\'lum')
        status_text = f"\n\n✅ *Siz premium foydalanuvchisiz!*\n📅 Amal qilish muddati: {until[:10]}"
    
    await message.answer(
        f"🌟 *Premium obuna* - ${SUBSCRIPTION_PRICE}/oy\n\n"
        f"*Premium imkoniyatlari:*\n"
        f"✅ Oyiga 10 tagacha bot yaratish\n"
        f"✅ Kanal va guruhlarni boshqarish\n"
        f"✅ Web App botlar yaratish\n"
        f"✅ Cheksiz xabar yuborish\n"
        f"✅ Prioritet texnik yordam\n"
        f"{status_text}\n\n"
        f"To'lov usulini tanlang:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def process_paystack(callback_query: types.CallbackQuery):
    """Paystack orqali to'lov"""
    # Paystack to'lov link yaratish
    payment_url = f"https://paystack.com/pay/{callback_query.from_user.id}"
    
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("💳 To'lov qilish", url=payment_url))
    keyboard.add(InlineKeyboardButton("✅ To'lovni tekshirish", callback_data="check_payment"))
    
    await callback_query.message.edit_text(
        f"💰 *To'lov summasi:* ${SUBSCRIPTION_PRICE}\n\n"
        f"Pastdagi tugma orqali to'lovni amalga oshiring:",
        parse_mode="Markdown",
        reply_markup=keyboard
    )
    await callback_query.answer()

async def process_usdt(callback_query: types.CallbackQuery):
    """USDT orqali to'lov"""
    await callback_query.message.edit_text(
        f"💰 *To'lov summasi:* ${SUBSCRIPTION_PRICE}\n\n"
        f"💸 *USDT (TRC20) manzili:*\n"
        f"`{USDT_WALLET}`\n\n"
        f"📝 To'lovni amalga oshirgandan so'ng, quyidagi buyruqni yuboring:\n"
        f"`/confirm_payment [TXID]`\n\n"
        f"Misol: `/confirm_payment 0x1234...`",
        parse_mode="Markdown"
    )
    await callback_query.answer()

async def confirm_payment(message: types.Message):
    """To'lovni tasdiqlash"""
    txid = message.get_args()
    if not txid:
        await message.answer("❌ Iltimos, TXID ni kiriting: /confirm_payment [TXID]")
        return
    
    # To'lovni saqlash
    sheet_manager.add_payment(
        user_id=message.from_user.id,
        amount=SUBSCRIPTION_PRICE,
        payment_method="usdt",
        transaction_id=txid
    )
    
    # Admin panelga xabar
    for admin_id in ADMIN_IDS:
        await message.bot.send_message(
            admin_id,
            f"🆕 *Yangi to'lov kutilmoqda!*\n\n"
            f"👤 Foydalanuvchi: {message.from_user.id}\n"
            f"💰 Summa: ${SUBSCRIPTION_PRICE}\n"
            f"🔑 TXID: `{txid}`\n\n"
            f"✅ Tasdiqlash uchun: `/approve_payment {txid}`",
            parse_mode="Markdown"
        )
    
    await message.answer(
        "✅ *To'lov ma'lumotlaringiz qabul qilindi!*\n\n"
        "Admin tomonidan tekshirilgandan so'ng obuna faollashtiriladi.\n"
        "Bu bir necha daqiqa vaqt olishi mumkin.",
        parse_mode="Markdown"
    )
