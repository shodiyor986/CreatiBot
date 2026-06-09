"""
Foydalanuvchi botlarini ko'rish va boshqarish
"""
from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from utils.sheet_manager import sheet


async def cmd_mybots(message: types.Message):
    await show_bots(message.from_user.id, message)


async def callback_my_bots(callback: types.CallbackQuery):
    await show_bots(callback.from_user.id, callback.message, edit=True)
    await callback.answer()


async def show_bots(user_id: int, message: types.Message, edit: bool = False):
    """Botlar ro'yxatini ko'rsatish"""
    bots = sheet.get_user_bots(user_id)

    if not bots:
        text = (
            "📋 <b>Mening botlarim</b>\n\n"
            "❌ Hali bot yaratilmagan.\n\n"
            "Yangi bot yaratish uchun tugmani bosing:"
        )
        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("🤖 Yangi bot yaratish", callback_data="create_bot"))
        kb.add(InlineKeyboardButton("⬅️ Asosiy menyu", callback_data="main_menu"))
    else:
        text = f"📋 <b>Mening botlarim</b> ({len(bots)} ta)\n\n"
        for i, bot in enumerate(bots, 1):
            status_emoji = "🟢" if bot.get("status") == "active" else "🔴"
            type_emojis = {"button": "🎛", "message": "💬", "webapp": "🌐"}
            type_emoji = type_emojis.get(bot.get("bot_type", ""), "🤖")

            text += (
                f"{i}. {status_emoji} {type_emoji} <b>{bot.get('name', 'Nomsiz')}</b>\n"
                f"   📅 {bot.get('created_at', '')[:10]}\n\n"
            )

        kb = InlineKeyboardMarkup(row_width=1)
        for bot in bots:
            token_short = bot.get("token", "")[:15]
            kb.add(InlineKeyboardButton(
                f"⚙️ {bot.get('name', 'Nomsiz')} ni boshqarish",
                callback_data=f"manage_bot:{bot.get('token', '')[:20]}"
            ))

        kb.add(InlineKeyboardButton("🤖 Yangi bot", callback_data="create_bot"))
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))

    if edit:
        await message.edit_text(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


async def callback_manage_bot(callback: types.CallbackQuery):
    """Bot boshqaruvi"""
    token_prefix = callback.data.split(":")[1]
    user_id = callback.from_user.id

    # To'liq tokenni topish
    bots = sheet.get_user_bots(user_id)
    target_bot = None
    for bot in bots:
        if bot.get("token", "").startswith(token_prefix):
            target_bot = bot
            break

    if not target_bot:
        await callback.answer("Bot topilmadi!", show_alert=True)
        return

    status = target_bot.get("status", "unknown")
    name = target_bot.get("name", "Nomsiz")
    bot_type = target_bot.get("bot_type", "")
    token = target_bot.get("token", "")
    created_at = target_bot.get("created_at", "")[:10]

    type_names = {"button": "🎛 Tugmali", "message": "💬 Xabar", "webapp": "🌐 Web App"}
    status_text = "🟢 Aktiv" if status == "active" else "🔴 To'xtatilgan"

    text = (
        f"⚙️ <b>Bot boshqaruvi</b>\n\n"
        f"📛 Nom: <b>{name}</b>\n"
        f"🎛 Tur: {type_names.get(bot_type, '🤖')}\n"
        f"📊 Status: {status_text}\n"
        f"📅 Yaratilgan: {created_at}\n"
        f"🔑 Token: <code>{token[:30]}...</code>"
    )

    kb = InlineKeyboardMarkup(row_width=2)

    if status == "active":
        kb.add(InlineKeyboardButton(
            "🔴 To'xtatish",
            callback_data=f"bot_stop:{token[:20]}"
        ))
    else:
        kb.add(InlineKeyboardButton(
            "🟢 Yoqish",
            callback_data=f"bot_start:{token[:20]}"
        ))

    kb.add(
        InlineKeyboardButton("📄 Kodni yuklab olish", callback_data=f"bot_code:{token[:20]}"),
        InlineKeyboardButton("🗑 O'chirish", callback_data=f"bot_delete:{token[:20]}")
    )
    kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="my_bots"))

    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


async def callback_bot_stop(callback: types.CallbackQuery):
    """Botni to'xtatish"""
    token_prefix = callback.data.split(":")[1]
    user_id = callback.from_user.id

    bots = sheet.get_user_bots(user_id)
    for bot in bots:
        if bot.get("token", "").startswith(token_prefix):
            sheet.update_bot_status(bot["token"], "stopped")
            await callback.answer("🔴 Bot to'xtatildi!", show_alert=True)
            await callback_my_bots(callback)
            return

    await callback.answer("Xato!", show_alert=True)


async def callback_bot_start(callback: types.CallbackQuery):
    """Botni yoqish"""
    token_prefix = callback.data.split(":")[1]
    user_id = callback.from_user.id

    bots = sheet.get_user_bots(user_id)
    for bot in bots:
        if bot.get("token", "").startswith(token_prefix):
            sheet.update_bot_status(bot["token"], "active")
            await callback.answer("🟢 Bot yoqildi!", show_alert=True)
            await callback_my_bots(callback)
            return


async def callback_bot_delete(callback: types.CallbackQuery):
    """Botni o'chirish - tasdiqlash"""
    token_prefix = callback.data.split(":")[1]

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("✅ Ha, o'chir", callback_data=f"bot_delete_confirm:{token_prefix}"),
        InlineKeyboardButton("❌ Yo'q", callback_data="my_bots")
    )

    await callback.message.edit_text(
        "⚠️ <b>Ishonchingiz komilmi?</b>\n\n"
        "Bu bot o'chirilsa, qayta tiklab bo'lmaydi!",
        reply_markup=kb
    )
    await callback.answer()


async def callback_bot_delete_confirm(callback: types.CallbackQuery):
    """Botni o'chirishni tasdiqlash"""
    token_prefix = callback.data.split(":")[1]
    user_id = callback.from_user.id

    bots = sheet.get_user_bots(user_id)
    for bot in bots:
        if bot.get("token", "").startswith(token_prefix):
            sheet.update_bot_status(bot["token"], "deleted")
            await callback.answer("🗑 Bot o'chirildi!", show_alert=True)
            await show_bots(user_id, callback.message, edit=True)
            return


async def callback_bot_code(callback: types.CallbackQuery):
    """Bot kodini yuborish"""
    token_prefix = callback.data.split(":")[1]
    user_id = callback.from_user.id

    bots = sheet.get_user_bots(user_id)
    for bot in bots:
        if bot.get("token", "").startswith(token_prefix):
            from utils.code_interpreter import interpret_scratch_code
            import io

            code = interpret_scratch_code(
                bot.get("scratch_code", ""),
                bot["token"]
            )

            code_file = io.BytesIO(code.encode('utf-8'))
            code_file.name = f"bot_{bot.get('name', 'bot').replace(' ', '_').lower()}.py"

            await callback.message.answer_document(
                code_file,
                caption=f"📄 <b>{bot.get('name')}</b> - Python kodi"
            )
            await callback.answer("✅ Kod yuborildi!")
            return

    await callback.answer("Xato!", show_alert=True)


def register_handlers(dp):
    dp.register_message_handler(cmd_mybots, commands=["mybots"])
    dp.register_callback_query_handler(callback_my_bots, lambda c: c.data == "my_bots")
    dp.register_callback_query_handler(callback_manage_bot,
                                        lambda c: c.data.startswith("manage_bot:"))
    dp.register_callback_query_handler(callback_bot_stop, lambda c: c.data.startswith("bot_stop:"))
    dp.register_callback_query_handler(callback_bot_start,
                                        lambda c: c.data.startswith("bot_start:"))
    dp.register_callback_query_handler(callback_bot_delete,
                                        lambda c: c.data.startswith("bot_delete:"))
    dp.register_callback_query_handler(callback_bot_delete_confirm,
                                        lambda c: c.data.startswith("bot_delete_confirm:"))
    dp.register_callback_query_handler(callback_bot_code, lambda c: c.data.startswith("bot_code:"))
