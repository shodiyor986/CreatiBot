from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sheet_manager import SheetManager

sheet_manager = SheetManager()

async def cmd_start(message: types.Message):
    """/start buyrug'i"""
    user_id = message.from_user.id
    username = message.from_user.username
    first_name = message.from_user.first_name
    
    # Foydalanuvchini bazaga qo'shish (agar yo'q bo'lsa)
    existing_user = sheet_manager.get_user(user_id)
    if not existing_user:
        sheet_manager.add_user(user_id, username, first_name)
    
    # Asosiy menyu
    keyboard = InlineKeyboardMarkup(row_width=2)
    keyboard.add(
        InlineKeyboardButton("➕ Yangi bot", callback_data="create_new"),
        InlineKeyboardButton("🤖 Mening botlarim", callback_data="my_bots")
    )
    keyboard.add(
        InlineKeyboardButton("🌟 Premium", callback_data="premium"),
        InlineKeyboardButton("📢 Kanallar", callback_data="channels_menu")
    )
    keyboard.add(
        InlineKeyboardButton("⚙️ Sozlamalar", callback_data="settings"),
        InlineKeyboardButton("❓ Yordam", callback_data="help")
    )
    
    # Premium status
    premium_text = ""
    if existing_user and existing_user.get('is_premium') == "TRUE":
        premium_text = "\n\n🌟 Siz premium foydalanuvchisiz!"
    
    await message.answer(
        f"🤖 *BotForge* ga xush kelibsiz, {first_name}!{premium_text}\n\n"
        f"Men sizga Telegram botlar yaratishda yordam beraman.\n\n"
        f"📌 *Imkoniyatlar:*\n"
        f"✅ Oddiy tugmali botlar\n"
        f"✅ Xabar yuboruvchi botlar\n"
        f"✅ Web App botlar\n"
        f"✅ Kanal va guruhlarni boshqarish\n\n"
        f"Bot yaratish uchun /newbot yoki pastdagi tugmalarni bosing.",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def cmd_help(message: types.Message):
    """/help buyrug'i"""
    help_text = """
📖 *BotForge Yordam Markazi*

*Asosiy buyruqlar:*
/newbot - Yangi bot yaratish
/mybots - Mening botlarim ro'yxati
/subscribe - Premium obuna olish
/channels - Kanallarni boshqarish
/settings - Sozlamalar

*Bot yaratish:*
1. /newbot buyrug'ini bosing
2. Bot turini tanlang
3. Bot nomi va username kiriting
4. Scratch bloklarni joylashtiring
5. Bot tayyor!

*Premium imkoniyatlari:*
• Oyiga 10 tagacha bot
• Kanal va guruh boshqaruvi
• Cheksiz Web App botlar
• Prioritet yordam

*Yordam kerakmi?* @admin ga murojaat qiling
"""
    await message.answer(help_text, parse_mode="Markdown")

# Callback handlerlar
async def process_callback(callback_query: types.CallbackQuery):
    data = callback_query.data
    
    if data == "create_new":
        from create_bot import cmd_new_bot
        await cmd_new_bot(callback_query.message)
    
    elif data == "my_bots":
        from my_bots import cmd_my_bots
        await cmd_my_bots(callback_query.message)
    
    elif data == "premium":
        from subscription import cmd_subscribe
        await cmd_subscribe(callback_query.message)
    
    elif data == "channels_menu":
        from channel_manager import cmd_manage_channels
        await cmd_manage_channels(callback_query.message)
    
    elif data == "help":
        await cmd_help(callback_query.message)
    
    await callback_query.answer()
