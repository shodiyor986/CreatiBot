"""
Bot yaratish handlerlari - FSM bilan
"""
import re
from aiogram import types
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from config import FREE_BOT_LIMIT, PREMIUM_BOT_LIMIT
from utils.sheet_manager import sheet
from utils.code_interpreter import validate_scratch_code, interpret_scratch_code


class BotCreateStates(StatesGroup):
    choosing_type = State()
    entering_token = State()
    entering_name = State()
    entering_code = State()
    confirming = State()


BOT_TYPES_INFO = {
    "button": {
        "emoji": "🎛",
        "name": "Tugmali bot",
        "desc": "Inline va reply tugmalar bilan ishlaydi"
    },
    "message": {
        "emoji": "💬",
        "name": "Xabar yuboruvchi bot",
        "desc": "Kalit so'zlar asosida avtomatik javob beradi"
    },
    "webapp": {
        "emoji": "🌐",
        "name": "Web App bot",
        "desc": "To'liq veb-interfeysga ega bot"
    }
}


async def cmd_newbot(message: types.Message):
    await start_bot_creation(message)


async def callback_create_bot(callback: types.CallbackQuery):
    await start_bot_creation(callback.message, edit=True)
    await callback.answer()


async def start_bot_creation(message: types.Message, edit: bool = False):
    """Bot yaratishni boshlash"""
    user_id = message.chat.id
    is_prem = sheet.is_premium(user_id)
    bot_count = len(sheet.get_user_bots(user_id))

    # Limit tekshirish
    limit = PREMIUM_BOT_LIMIT if is_prem else FREE_BOT_LIMIT
    if bot_count >= limit:
        text = (
            f"❌ <b>Limit to'ldi!</b>\n\n"
            f"Siz allaqachon {bot_count} ta bot yaratgansiz.\n"
            f"{'Premium limit: ' + str(PREMIUM_BOT_LIMIT) if is_prem else 'Bepul limit: ' + str(FREE_BOT_LIMIT) + ' ta'}\n\n"
            f"{'Yangi bot yaratish uchun mavjud botni o'chirib tashlang.' if is_prem else 'Ko'proq bot uchun /subscribe buyrug'ini bering.'}"
        )
        kb = InlineKeyboardMarkup()
        if not is_prem:
            kb.add(InlineKeyboardButton("💎 Premium olish", callback_data="premium"))
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))

        if edit:
            await message.edit_text(text, reply_markup=kb)
        else:
            await message.answer(text, reply_markup=kb)
        return

    # Bot turi tanlash
    kb = InlineKeyboardMarkup(row_width=1)
    for type_key, info in BOT_TYPES_INFO.items():
        kb.add(InlineKeyboardButton(
            f"{info['emoji']} {info['name']} - {info['desc']}",
            callback_data=f"bot_type:{type_key}"
        ))
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="main_menu"))

    text = (
        "🤖 <b>Bot yaratish</b>\n\n"
        "Qaysi turdagi bot yaratmoqchisiz?\n\n"
        "💡 <b>Maslahat:</b> BotFather (@BotFather) dan avval bot token oling!"
    )

    if edit:
        await message.edit_text(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


async def callback_bot_type(callback: types.CallbackQuery, state: FSMContext):
    """Bot turi tanlandi"""
    bot_type = callback.data.split(":")[1]
    info = BOT_TYPES_INFO[bot_type]

    await state.update_data(bot_type=bot_type)
    await BotCreateStates.entering_token.set()

    text = (
        f"{info['emoji']} <b>{info['name']}</b> tanlandi!\n\n"
        "🔑 Endi BotFather (@BotFather) dan olgan <b>bot tokenini</b> yuboring.\n\n"
        "<i>Misol: 123456789:AAHNzxxxxxxxxxxxxxxxx</i>"
    )
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_create"))

    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


async def process_token(message: types.Message, state: FSMContext):
    """Bot tokenini qayta ishlash"""
    token = message.text.strip()

    # Token formati tekshirish
    token_pattern = r'^\d{8,10}:[A-Za-z0-9_-]{35,}$'
    if not re.match(token_pattern, token):
        await message.answer(
            "❌ <b>Noto'g'ri token formati!</b>\n\n"
            "Token shunday ko'rinishda bo'lishi kerak:\n"
            "<code>123456789:AAHNzxxxxxxxxxxxxxxxx</code>\n\n"
            "BotFather dan to'g'ri token oling va qayta yuboring."
        )
        return

    # Token allaqachon ishlatilgan emasligini tekshirish
    existing = sheet.get_bot(token)
    if existing:
        await message.answer(
            "❌ Bu token allaqachon ishlatilgan!\n"
            "Boshqa bot yarating va yangi token kiriting."
        )
        return

    await state.update_data(token=token)
    await BotCreateStates.entering_name.set()

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_create"))

    await message.answer(
        "✅ Token qabul qilindi!\n\n"
        "📝 Endi botingizga <b>ism bering</b> (o'zbek tilida):\n\n"
        "<i>Misol: Mening Do'konchim, Test Bot, va h.k.</i>",
        reply_markup=kb
    )


async def process_name(message: types.Message, state: FSMContext):
    """Bot nomini qayta ishlash"""
    name = message.text.strip()

    if len(name) < 2 or len(name) > 64:
        await message.answer("❌ Bot nomi 2-64 belgidan iborat bo'lishi kerak!")
        return

    await state.update_data(name=name)
    await BotCreateStates.entering_code.set()

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("⏭ Keyinchalik", callback_data="skip_code"),
        InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_create")
    )

    data = await state.get_data()
    bot_type = data.get("bot_type")

    if bot_type == "button":
        code_example = '''[
  {"type": "button_menu", "data": {"button": "Mahsulotlar", "response": "Mahsulotlar ro'yxati!"}},
  {"type": "keyword_reply", "data": {"keyword": "narx", "reply": "Narxlar: 10.000 so'm dan"}}
]'''
    elif bot_type == "message":
        code_example = '''[
  {"type": "keyword_reply", "data": {"keyword": "salom", "reply": "Salom! Xush kelibsiz!"}},
  {"type": "send_message", "data": {"trigger": "/info", "message": "Bu bizning bot!"}}
]'''
    else:
        code_example = '''[
  {"type": "webapp", "data": {"url": "https://example.com", "button_text": "Saytni ochish"}}
]'''

    await message.answer(
        f"📝 Bot nomi: <b>{name}</b>\n\n"
        f"🎨 Endi <b>Scratch kodi</b> (JSON format) yuboring:\n\n"
        f"<code>{code_example}</code>\n\n"
        f"<i>Yoki 'Keyinchalik' bosib o'tkazib yuboring - "
        f"standart bot yaratiladi</i>",
        reply_markup=kb
    )


async def callback_skip_code(callback: types.CallbackQuery, state: FSMContext):
    """Kodni o'tkazib yuborish"""
    await state.update_data(scratch_code="")
    await show_confirmation(callback.message, state, edit=True)
    await callback.answer()


async def process_scratch_code(message: types.Message, state: FSMContext):
    """Scratch kodini qayta ishlash"""
    code = message.text.strip()
    is_valid, msg = validate_scratch_code(code)

    if not is_valid:
        await message.answer(
            f"❌ <b>Kod xatosi:</b> {msg}\n\n"
            "JSON formatni to'g'rilang va qayta yuboring.\n"
            "Yoki 'Keyinchalik' bosib o'tkazib yuboring."
        )
        return

    await state.update_data(scratch_code=code)
    await show_confirmation(message, state)


async def show_confirmation(message: types.Message, state: FSMContext, edit: bool = False):
    """Tasdiqlash oynasi"""
    data = await state.get_data()
    bot_type = data.get("bot_type", "")
    token = data.get("token", "")
    name = data.get("name", "")
    code = data.get("scratch_code", "")

    info = BOT_TYPES_INFO.get(bot_type, {})

    text = (
        "✅ <b>Bot ma'lumotlari</b>\n\n"
        f"📛 Nom: <b>{name}</b>\n"
        f"🎛 Tur: <b>{info.get('emoji', '')} {info.get('name', '')}</b>\n"
        f"🔑 Token: <code>{token[:20]}...</code>\n"
        f"📋 Bloklar: <b>{'Bor' if code else 'Standart'}</b>\n\n"
        "Tasdiqlaysizmi?"
    )

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("✅ Yaratish", callback_data="confirm_create"),
        InlineKeyboardButton("❌ Bekor", callback_data="cancel_create")
    )

    await BotCreateStates.confirming.set()

    if edit:
        await message.edit_text(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


async def callback_confirm_create(callback: types.CallbackQuery, state: FSMContext):
    """Bot yaratishni tasdiqlash"""
    data = await state.get_data()
    user_id = callback.from_user.id

    success = sheet.create_bot(
        token=data["token"],
        name=data["name"],
        username="",
        owner_id=user_id,
        bot_type=data["bot_type"],
        scratch_code=data.get("scratch_code", "")
    )

    await state.finish()

    if success:
        # Python kodni yaratish
        code = interpret_scratch_code(data.get("scratch_code", ""), data["token"])

        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("📋 Mening botlarim", callback_data="my_bots"))
        kb.add(InlineKeyboardButton("🏠 Asosiy menyu", callback_data="main_menu"))

        await callback.message.edit_text(
            f"🎉 <b>Bot muvaffaqiyatli yaratildi!</b>\n\n"
            f"📛 Nom: <b>{data['name']}</b>\n"
            f"✅ Status: Aktiv\n\n"
            f"<i>Bot kodi quyida yuboriladi...</i>",
            reply_markup=kb
        )

        # Kodni fayl sifatida yuborish
        import io
        code_file = io.BytesIO(code.encode('utf-8'))
        code_file.name = f"bot_{data['name'].replace(' ', '_').lower()}.py"
        await callback.message.answer_document(
            code_file,
            caption=(
                f"📄 <b>{data['name']}</b> uchun Python kodi\n\n"
                "1. requirements.txt: <code>pip install aiogram</code>\n"
                "2. Kodni ishga tushiring: <code>python bot.py</code>\n"
                "3. Yoki Render.com ga deploy qiling"
            )
        )
    else:
        await callback.message.edit_text(
            "❌ Xato yuz berdi! Qaytadan urinib ko'ring.",
            reply_markup=InlineKeyboardMarkup().add(
                InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu")
            )
        )

    await callback.answer()


async def callback_cancel_create(callback: types.CallbackQuery, state: FSMContext):
    """Bekor qilish"""
    await state.finish()
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("🏠 Asosiy menyu", callback_data="main_menu"))
    await callback.message.edit_text("❌ Bekor qilindi.", reply_markup=kb)
    await callback.answer()


def register_handlers(dp):
    dp.register_message_handler(cmd_newbot, commands=["newbot"])
    dp.register_callback_query_handler(callback_create_bot, lambda c: c.data == "create_bot")
    dp.register_callback_query_handler(
        callback_bot_type,
        lambda c: c.data.startswith("bot_type:"),
        state="*"
    )
    dp.register_message_handler(process_token, state=BotCreateStates.entering_token)
    dp.register_message_handler(process_name, state=BotCreateStates.entering_name)
    dp.register_message_handler(process_scratch_code, state=BotCreateStates.entering_code)
    dp.register_callback_query_handler(callback_skip_code, lambda c: c.data == "skip_code",
                                        state=BotCreateStates.entering_code)
    dp.register_callback_query_handler(callback_confirm_create, lambda c: c.data == "confirm_create",
                                        state=BotCreateStates.confirming)
    dp.register_callback_query_handler(callback_cancel_create, lambda c: c.data == "cancel_create",
                                        state="*")
