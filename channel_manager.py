from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sheet_manager import SheetManager
from channel_api import ChannelManager

sheet_manager = SheetManager()
channel_manager = ChannelManager()

async def cmd_manage_channels(message: types.Message):
    """Kanal va guruhlarni boshqarish"""
    user = sheet_manager.get_user(message.from_user.id)
    
    # Faqat premium foydalanuvchilar uchun
    if not user or user.get('is_premium') != "TRUE":
        await message.answer(
            "❌ *Bu funksiya faqat premium foydalanuvchilar uchun!*\n\n"
            "Premium obuna olish uchun /subscribe",
            parse_mode="Markdown"
        )
        return
    
    channels = sheet_manager.get_user_channels(message.from_user.id)
    
    keyboard = InlineKeyboardMarkup(row_width=2)
    keyboard.add(
        InlineKeyboardButton("➕ Kanal qo'shish", callback_data="add_channel"),
        InlineKeyboardButton("📋 Mening kanallarim", callback_data="list_channels")
    )
    
    await message.answer(
        f"📢 *Kanal va Guruhlarni boshqarish*\n\n"
        f"Siz {len(channels)} ta kanal/guruhni boshqaryapsiz.\n\n"
        f"*Vazifalar:*\n"
        f"• Xabar yuborish\n"
        f"• A'zolarni boshqarish\n"
        f"• Post schedule qilish\n"
        f"• Statistika ko'rish",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def add_channel_process(callback_query: types.CallbackQuery):
    """Kanal qo'shish"""
    await callback_query.message.edit_text(
        "🤖 *Kanal yoki guruh qo'shish:*\n\n"
        "1. Botni kanalingizga **admin** qilib qo'shing\n"
        "2. Bot username: `@BotForgeBot`\n"
        "3. Quyidagi buyruqni yuboring:\n"
        "`/add_channel @channel_username`\n\n"
        "Yoki kanal ID sini kiriting:\n"
        "`/add_channel -100123456789`",
        parse_mode="Markdown"
    )
    await callback_query.answer()

async def add_channel_command(message: types.Message):
    """Kanal qo'shish buyrug'i"""
    args = message.get_args()
    if not args:
        await message.answer("❌ Iltimos, kanal username yoki ID sini kiriting: /add_channel @kanal")
        return
    
    channel_input = args.strip()
    
    # Kanal ma'lumotlarini olish
    channel_info = await channel_manager.get_channel_info(channel_input)
    
    if channel_info:
        sheet_manager.add_channel(
            user_id=message.from_user.id,
            channel_id=str(channel_info['id']),
            channel_name=channel_info['title'],
            channel_type=channel_info['type']
        )
        await message.answer(f"✅ *Kanal qo'shildi:* {channel_info['title']}", parse_mode="Markdown")
    else:
        await message.answer(
            "❌ *Kanal topilmadi!*\n\n"
            "Bot kanalda admin ekanligiga va username to'g'riligiga ishonch hosil qiling.",
            parse_mode="Markdown"
        )

async def list_channels(callback_query: types.CallbackQuery):
    """Foydalanuvchining kanallarini ko'rsatish"""
    channels = sheet_manager.get_user_channels(callback_query.from_user.id)
    
    if not channels:
        await callback_query.message.edit_text("📭 Siz hali hech qanday kanal qo'shmagansiz.")
        return
    
    text = "📋 *Sizning kanal va guruhlaringiz:*\n\n"
    
    for ch in channels:
        text += f"📢 *{ch['channel_name']}*\n"
        text += f"🆔 ID: `{ch['channel_id']}`\n"
        text += f"📊 Status: {ch.get('is_active', 'TRUE')}\n"
        text += f"➖➖➖➖➖➖\n"
    
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("➕ Yangi kanal qo'shish", callback_data="add_channel"))
    keyboard.add(InlineKeyboardButton("🔙 Ortga", callback_data="back_to_menu"))
    
    await callback_query.message.edit_text(text, parse_mode="Markdown", reply_markup=keyboard)
    await callback_query.answer()
