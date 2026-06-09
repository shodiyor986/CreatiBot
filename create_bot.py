"""
/start va /help handlerlari
"""
from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from config import MESSAGES, WEBAPP_URL
from utils.sheet_manager import sheet


def get_main_keyboard(user_id: int) -> InlineKeyboardMarkup:
    """Asosiy menyu tugmalari"""
    is_prem = sheet.is_premium(user_id)

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("🤖 Yangi bot yaratish", callback_data="create_bot"),
        InlineKeyboardButton("📋 Mening botlarim", callback_data="my_bots"),
    )
    kb.add(
        InlineKeyboardButton("📢 Kanallarim", callback_data="my_channels"),
        InlineKeyboardButton("💎 Premium" + (" ✅" if is_prem else ""), callback_data="premium"),
    )
    kb.add(
        InlineKeyboardButton("🌐 WebApp ni ochish", web_app=types.WebAppInfo(url=WEBAPP_URL))
    )
    kb.add(
        InlineKeyboardButton("❓ Yordam", callback_data="help"),
        InlineKeyboardButton("📊 Statistika", callback_data="stats"),
    )
    return kb


async def cmd_start(message: types.Message):
    """Startga javob"""
    user = message.from_user

    # Foydalanuvchini bazaga saqlash
    sheet.create_user(
        telegram_id=user.id,
        username=user.username,
        first_name=user.first_name
    )

    db_user = sheet.get_user(user.id)
    is_prem = db_user and db_user.get("is_premium") == "true"

    text = (
        f"👋 Salom, <b>{user.first_name}</b>!\n\n"
        f"🤖 <b>BotForge</b> ga xush kelibsiz!\n\n"
        f"Bu yerda hech qanday dasturlash bilimisiz "
        f"o'z Telegram botingizni yaratishingiz mumkin.\n\n"
        f"{'💎 <b>Premium</b> foydalanuvchi' if is_prem else '🆓 Bepul foydalanuvchi'}\n\n"
        f"👇 Quyidagi menyudan tanlang:"
    )

    await message.answer(text, reply_markup=get_main_keyboard(user.id))


async def cmd_help(message: types.Message):
    """Yordam"""
    help_text = (
        "❓ <b>BotForge - Yordam</b>\n\n"
        "📌 <b>Buyruqlar:</b>\n"
        "/start - Asosiy menyu\n"
        "/newbot - Yangi bot yaratish\n"
        "/mybots - Mening botlarim\n"
        "/subscribe - Premium obuna\n"
        "/channels - Kanallarni boshqarish\n\n"
        "🤖 <b>Bot turlari:</b>\n"
        "1. Tugmali bot - inline va reply tugmalar\n"
        "2. Xabar yuboruvchi - keyword asosida javob\n"
        "3. Web App bot - to'liq veb-interfeys\n\n"
        "💎 <b>Premium imkoniyatlari:</b>\n"
        "• 10 tagacha bot yaratish\n"
        "• Kanal boshqaruvi\n"
        "• Cheksiz xabar yuborish\n"
        "• Ustuvor yordam\n\n"
        "📞 Muammo bo'lsa: @BotForgeSupport"
    )
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("🏠 Asosiy menyu", callback_data="main_menu"))
    await message.answer(help_text, reply_markup=kb)


async def callback_main_menu(callback: types.CallbackQuery):
    """Asosiy menyu ga qaytish"""
    user = callback.from_user
    is_prem = sheet.is_premium(user.id)

    text = (
        f"🏠 <b>Asosiy menyu</b>\n\n"
        f"👤 {user.first_name}\n"
        f"{'💎 Premium' if is_prem else '🆓 Bepul'} foydalanuvchi"
    )

    await callback.message.edit_text(text, reply_markup=get_main_keyboard(user.id))
    await callback.answer()


async def callback_help(callback: types.CallbackQuery):
    """Yordam callback"""
    help_text = (
        "❓ <b>Yordam</b>\n\n"
        "Bot yaratish uchun '🤖 Yangi bot yaratish' ni bosing.\n\n"
        "Savollar uchun: @BotForgeSupport"
    )
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))
    await callback.message.edit_text(help_text, reply_markup=kb)
    await callback.answer()


async def callback_stats(callback: types.CallbackQuery):
    """Shaxsiy statistika"""
    user_id = callback.from_user.id
    db_user = sheet.get_user(user_id)
    bots = sheet.get_user_bots(user_id)
    channels = sheet.get_user_channels(user_id)
    is_prem = sheet.is_premium(user_id)

    text = (
        f"📊 <b>Mening statistikam</b>\n\n"
        f"🤖 Botlar: {len(bots)} ta\n"
        f"📢 Kanallar: {len(channels)} ta\n"
        f"{'💎 Premium: ✅' if is_prem else '🆓 Premium: ❌'}\n\n"
    )

    if is_prem and db_user:
        premium_until = db_user.get("premium_until", "")
        if premium_until:
            from datetime import datetime
            try:
                exp = datetime.fromisoformat(premium_until)
                text += f"📅 Premium muddati: {exp.strftime('%d.%m.%Y')}\n"
            except:
                pass

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))
    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


def register_handlers(dp):
    dp.register_message_handler(cmd_start, commands=["start"])
    dp.register_message_handler(cmd_help, commands=["help"])
    dp.register_callback_query_handler(callback_main_menu, lambda c: c.data == "main_menu")
    dp.register_callback_query_handler(callback_help, lambda c: c.data == "help")
    dp.register_callback_query_handler(callback_stats, lambda c: c.data == "stats")
