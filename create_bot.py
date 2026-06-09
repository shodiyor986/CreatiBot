from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sheet_manager import SheetManager
from code_interpreter import SCRATCH_TEMPLATES
import json
from config import FREE_USER_BOT_LIMIT, PREMIUM_USER_BOT_LIMIT

sheet_manager = SheetManager()

async def cmd_new_bot(message: types.Message):
    """Yangi bot yaratish"""
    user_id = message.from_user.id
    user = sheet_manager.get_user(user_id)
    
    # Bot yaratish limitini tekshirish
    bots_count = len(sheet_manager.get_user_bots(user_id))
    
    if user and user.get('is_premium') == "TRUE":
        max_bots = PREMIUM_USER_BOT_LIMIT
    else:
        max_bots = FREE_USER_BOT_LIMIT
    
    if bots_count >= max_bots:
        await message.answer(
            f"❌ Siz bot yaratish limitiga yetdingiz!\n\n"
            f"📊 Siz {bots_count}/{max_bots} ta bot yaratdingiz.\n\n"
            f"🌟 Ko'proq bot yaratish uchun /subscribe orqali premium obuna oling!"
        )
        return
    
    # Bot turlari menyusi
    keyboard = InlineKeyboardMarkup(row_width=2)
    
    for bot_type, template in SCRATCH_TEMPLATES.items():
        keyboard.add(InlineKeyboardButton(
            text=f"📦 {template['name']}",
            callback_data=f"create_{bot_type}"
        ))
    
    await message.answer(
        "🤖 *Yangi bot yaratish*\n\n"
        "Bot turini tanlang:\n\n"
        "• *Oddiy tugmali bot* - Tugmalar bilan ishlaydi\n"
        "• *Xabar yuboruvchi bot* - Avtomatik javob beradi\n"
        "• *Web App bot* - Veb-ilova bilan ishlaydi\n\n"
        f"📊 Siz {bots_count}/{max_bots} ta bot yaratdingiz.",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def process_bot_creation(callback_query: types.CallbackQuery):
    """Bot yaratish jarayoni"""
    bot_type = callback_query.data.replace('create_', '')
    template = SCRATCH_TEMPLATES[bot_type]
    
    # FSM ga o'xshash oddiy saqlash
    # (oddiy holatda foydalanuvchi ma'lumotlarini vaqtincha saqlaymiz)
    user_data = {
        'bot_type': bot_type,
        'template': template,
        'step': 'waiting_name'
    }
    
    await callback_query.message.edit_text(
        f"✅ Siz *{template['name']}* yaratishni tanladingiz\n\n"
        f"📝 *1-qadam:* Bot nomini kiriting\n"
        f"Misol: `Mening Botim`\n\n"
        f"Bot nomi foydalanuvchilarga ko'rinadi.",
        parse_mode="Markdown"
    )
    await callback_query.answer()

async def create_bot_from_webapp(message, bot_name, bot_username, bot_type, scratch_code):
    """WebApp dan bot yaratish"""
    user = sheet_manager.get_user(message.from_user.id)
    
    # Limit tekshirish
    bots_count = len(sheet_manager.get_user_bots(message.from_user.id))
    max_bots = PREMIUM_USER_BOT_LIMIT if user.get('is_premium') == "TRUE" else FREE_USER_BOT_LIMIT
    
    if bots_count >= max_bots:
        await message.answer("❌ Siz bot yaratish limitiga yetdingiz!")
        return
    
    # BotFather orqali bot yaratish
    from bot_father_api import BotFatherAPI
    bot_father = BotFatherAPI()
    
    try:
        # Haqiqiy bot yaratish (bu yerda mock, aslida BotFather API kerak)
        bot_token = f"mock_token_{message.from_user.id}_{bot_username}"
        
        # Botni saqlash
        bot_data = {
            'token': bot_token,
            'name': bot_name,
            'username': bot_username,
            'owner_id': message.from_user.id,
            'bot_type': bot_type,
            'scratch_code': json.dumps(scratch_code),
            'status': 'active'
        }
        
        sheet_manager.save_bot(bot_data)
        
        await message.answer(
            f"✅ *Bot muvaffaqiyatli yaratildi!*\n\n"
            f"🤖 Nomi: {bot_name}\n"
            f"🔗 Username: @{bot_username}\n"
            f"🔑 Token: `{bot_token}`\n\n"
            f"Botni sinab ko'ring: t.me/{bot_username}",
            parse_mode="Markdown"
        )
    
    except Exception as e:
        await message.answer(f"❌ Xatolik: {str(e)}")
