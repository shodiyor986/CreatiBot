"""
Kanal va guruh boshqaruvi
"""
from aiogram import types
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from utils.sheet_manager import sheet
from utils.channel_api import get_chat_info, get_channel_members_count, check_bot_is_admin


class ChannelStates(StatesGroup):
    waiting_channel_id = State()
    waiting_message_text = State()


async def cmd_channels(message: types.Message):
    await show_channels(message.from_user.id, message)


async def callback_my_channels(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    if not sheet.is_premium(user_id):
        await callback.answer("💎 Bu funksiya faqat Premium uchun!", show_alert=True)
        return
    await show_channels(user_id, callback.message, edit=True)
    await callback.answer()


async def show_channels(user_id: int, message: types.Message, edit: bool = False):
    """Kanallar ro'yxati"""
    if not sheet.is_premium(user_id):
        text = (
            "📢 <b>Kanal boshqaruvi</b>\n\n"
            "❌ Bu funksiya faqat <b>Premium</b> foydalanuvchilar uchun!\n\n"
            "💎 Premium olish uchun /subscribe"
        )
        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("💎 Premium olish", callback_data="premium"))
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))

        if edit:
            await message.edit_text(text, reply_markup=kb)
        else:
            await message.answer(text, reply_markup=kb)
        return

    channels = sheet.get_user_channels(user_id)

    if not channels:
        text = (
            "📢 <b>Mening kanallarim</b>\n\n"
            "Hali kanal qo'shilmagan.\n\n"
            "Bot admin bo'lgan kanalingizni qo'shing:"
        )
        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("➕ Kanal qo'shish", callback_data="add_channel"))
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))
    else:
        text = f"📢 <b>Mening kanallarim</b> ({len(channels)} ta)\n\n"
        for i, ch in enumerate(channels, 1):
            type_emoji = "📢" if ch.get("channel_type") == "channel" else "👥"
            text += f"{i}. {type_emoji} <b>{ch.get('channel_name', 'Nomsiz')}</b>\n"
            text += f"   ID: <code>{ch.get('channel_id', '')}</code>\n\n"

        kb = InlineKeyboardMarkup(row_width=1)
        for ch in channels:
            kb.add(InlineKeyboardButton(
                f"⚙️ {ch.get('channel_name', 'Nomsiz')}",
                callback_data=f"manage_channel:{ch.get('channel_id', '')}"
            ))
        kb.add(InlineKeyboardButton("➕ Yangi kanal", callback_data="add_channel"))
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))

    if edit:
        await message.edit_text(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


async def callback_add_channel(callback: types.CallbackQuery, state: FSMContext):
    """Kanal qo'shish"""
    await ChannelStates.waiting_channel_id.set()

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_channel"))

    await callback.message.edit_text(
        "📢 <b>Kanal qo'shish</b>\n\n"
        "1️⃣ Kanalingizga botni admin qilib qo'shing\n"
        "2️⃣ Kanal username yoki ID sini yuboring\n\n"
        "Misol:\n"
        "• <code>@my_channel</code>\n"
        "• <code>-1001234567890</code>",
        reply_markup=kb
    )
    await callback.answer()


async def process_channel_id(message: types.Message, state: FSMContext):
    """Kanal ID ni qayta ishlash"""
    channel_id = message.text.strip()
    user_id = message.from_user.id

    # Bot admin ekanligini tekshirish
    is_admin = await check_bot_is_admin(channel_id)
    if not is_admin:
        await message.answer(
            "❌ Bot bu kanalda admin emas!\n\n"
            "1. Botni kanalga qo'shing\n"
            "2. Admin huquqini bering\n"
            "3. Keyin qayta yuboring:"
        )
        return

    # Kanal ma'lumotlarini olish
    chat_info = await get_chat_info(channel_id)

    if not chat_info.get("success"):
        await message.answer(
            f"❌ Kanal topilmadi: {chat_info.get('error', 'Xato')}\n\n"
            "Username yoki ID ni tekshiring."
        )
        return

    channel_name = chat_info.get("title", "Nomsiz kanal")
    channel_type = chat_info.get("type", "channel")

    # Bazaga saqlash
    success = sheet.add_channel(
        user_id=user_id,
        channel_id=channel_id,
        channel_name=channel_name,
        channel_type=channel_type
    )

    await state.finish()

    if success:
        members = await get_channel_members_count(channel_id)
        await message.answer(
            f"✅ <b>Kanal muvaffaqiyatli qo'shildi!</b>\n\n"
            f"📢 {channel_name}\n"
            f"👥 A'zolar: {members} ta\n\n"
            "Endi kanalga xabar yuborishingiz mumkin!"
        )
        await show_channels(user_id, message)
    else:
        await message.answer("❌ Xato yuz berdi! Qaytadan urinib ko'ring.")


async def callback_manage_channel(callback: types.CallbackQuery):
    """Kanal boshqaruvi"""
    channel_id = ":".join(callback.data.split(":")[1:])  # channel_id ichida : bo'lishi mumkin
    user_id = callback.from_user.id

    channels = sheet.get_user_channels(user_id)
    target_channel = None
    for ch in channels:
        if ch.get("channel_id") == channel_id:
            target_channel = ch
            break

    if not target_channel:
        await callback.answer("Kanal topilmadi!", show_alert=True)
        return

    members = await get_channel_members_count(channel_id)
    channel_name = target_channel.get("channel_name", "Nomsiz")

    text = (
        f"📢 <b>{channel_name}</b>\n\n"
        f"👥 A'zolar: {members} ta\n"
        f"🆔 ID: <code>{channel_id}</code>\n\n"
        "Nima qilmoqchisiz?"
    )

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("📨 Xabar yuborish", callback_data=f"send_to_channel:{channel_id}"),
        InlineKeyboardButton("📊 Statistika", callback_data=f"channel_stats:{channel_id}")
    )
    kb.add(
        InlineKeyboardButton("🗑 O'chirish", callback_data=f"remove_channel:{channel_id}"),
        InlineKeyboardButton("⬅️ Orqaga", callback_data="my_channels")
    )

    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


async def callback_send_to_channel(callback: types.CallbackQuery, state: FSMContext):
    """Kanalga xabar yuborish"""
    channel_id = ":".join(callback.data.split(":")[1:])
    await state.update_data(channel_id=channel_id)
    await ChannelStates.waiting_message_text.set()

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_channel"))

    await callback.message.edit_text(
        "📨 <b>Kanalga xabar yuborish</b>\n\n"
        "Xabar matnini yuboring.\n"
        "<b>HTML</b> formatdan foydalanishingiz mumkin:\n"
        "• <code>&lt;b&gt;qalin&lt;/b&gt;</code>\n"
        "• <code>&lt;i&gt;kursiv&lt;/i&gt;</code>\n"
        "• <code>&lt;code&gt;kod&lt;/code&gt;</code>",
        reply_markup=kb
    )
    await callback.answer()


async def process_channel_message(message: types.Message, state: FSMContext):
    """Kanalga xabar yuborish - matn qayta ishlash"""
    data = await state.get_data()
    channel_id = data.get("channel_id")
    text = message.text or message.caption or ""

    from utils.channel_api import send_message_to_channel
    result = await send_message_to_channel(channel_id, text)

    await state.finish()

    if result.get("ok"):
        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("📢 Kanallarga qaytish", callback_data="my_channels"))
        await message.answer("✅ Xabar muvaffaqiyatli yuborildi!", reply_markup=kb)
    else:
        await message.answer(
            f"❌ Xabar yuborishda xato: {result.get('description', 'Noma\\'lum xato')}"
        )


async def callback_remove_channel(callback: types.CallbackQuery):
    """Kanalni o'chirish"""
    channel_id = ":".join(callback.data.split(":")[1:])
    user_id = callback.from_user.id

    sheet.remove_channel(user_id, channel_id)
    await callback.answer("✅ Kanal ro'yxatdan olib tashlandi!", show_alert=True)
    await show_channels(user_id, callback.message, edit=True)


async def callback_cancel_channel(callback: types.CallbackQuery, state: FSMContext):
    await state.finish()
    await show_channels(callback.from_user.id, callback.message, edit=True)
    await callback.answer()


def register_handlers(dp):
    dp.register_message_handler(cmd_channels, commands=["channels", "add_channel"])
    dp.register_callback_query_handler(callback_my_channels, lambda c: c.data == "my_channels")
    dp.register_callback_query_handler(callback_add_channel, lambda c: c.data == "add_channel",
                                        state="*")
    dp.register_message_handler(process_channel_id, state=ChannelStates.waiting_channel_id)
    dp.register_message_handler(process_channel_message,
                                 state=ChannelStates.waiting_message_text)
    dp.register_callback_query_handler(callback_manage_channel,
                                        lambda c: c.data.startswith("manage_channel:"))
    dp.register_callback_query_handler(callback_send_to_channel,
                                        lambda c: c.data.startswith("send_to_channel:"),
                                        state="*")
    dp.register_callback_query_handler(callback_remove_channel,
                                        lambda c: c.data.startswith("remove_channel:"))
    dp.register_callback_query_handler(callback_cancel_channel,
                                        lambda c: c.data == "cancel_channel", state="*")
