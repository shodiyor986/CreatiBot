from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sheet_manager import SheetManager

sheet_manager = SheetManager()

async def cmd_my_bots(message: types.Message):
    """Foydalanuvchining barcha botlarini ko'rsatish"""
    user_id = message.from_user.id
    bots = sheet_manager.get_user_bots(user_id)
    
    if not bots:
        await message.answer(
            "📭 Siz hali hech qanday bot yaratmagansiz.\n\n"
            "Yangi bot yaratish uchun /newbot buyrug'ini bosing."
        )
        return
    
    text = f"🤖 *Sizning botlaringiz ({len(bots)} ta):*\n\n"
    keyboard = InlineKeyboardMarkup(row_width=1)
    
    for bot in bots:
        text += f"📌 *{bot['name']}*\n"
        text += f"   🔗 @{bot['username']}\n"
        text += f"   📊 Status: {bot.get('status', 'active')}\n"
        text += f"   🕒 Yaratilgan: {bot.get('created_at', 'N/A')[:10]}\n\n"
        
        keyboard.add(InlineKeyboardButton(
            text=f"📊 {bot['name']}",
            callback_data=f"bot_{bot['token']}"
        ))
    
    keyboard.add(InlineKeyboardButton("➕ Yangi bot", callback_data="create_new"))
    
    await message.answer(text, parse_mode="Markdown", reply_markup=keyboard)
