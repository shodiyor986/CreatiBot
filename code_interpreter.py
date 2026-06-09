"""
Scratch blok kodlarini Telegram bot ga aylantiruvchi interpretator
"""
import json
import logging

logger = logging.getLogger(__name__)


def interpret_scratch_code(scratch_code: str, bot_token: str) -> str:
    """
    Scratch JSON kodini Python aiogram kodiga aylantirish
    """
    try:
        blocks = json.loads(scratch_code)
    except json.JSONDecodeError:
        return generate_default_bot(bot_token)

    python_code = generate_bot_header(bot_token)
    handlers = []

    for block in blocks:
        block_type = block.get("type", "")
        block_data = block.get("data", {})

        if block_type == "send_message":
            handler = generate_message_handler(block_data)
            handlers.append(handler)

        elif block_type == "keyword_reply":
            handler = generate_keyword_handler(block_data)
            handlers.append(handler)

        elif block_type == "button_menu":
            handler = generate_button_handler(block_data)
            handlers.append(handler)

        elif block_type == "inline_button":
            handler = generate_inline_handler(block_data)
            handlers.append(handler)

        elif block_type == "webapp":
            handler = generate_webapp_handler(block_data)
            handlers.append(handler)

    python_code += "\n\n".join(handlers)
    python_code += "\n\n" + generate_bot_footer()

    return python_code


def generate_bot_header(token: str) -> str:
    return f'''"""
Bot yaratildi: BotForge tomonidan
"""
import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = "{token}"
bot = Bot(token=BOT_TOKEN, parse_mode="HTML")
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)


@dp.message_handler(commands=["start"])
async def cmd_start(message: types.Message):
    await message.answer(
        "👋 Salom! Bot ishga tushdi!\\n\\nBu bot BotForge orqali yaratildi 🤖",
        reply_markup=get_main_keyboard()
    )


def get_main_keyboard():
    kb = ReplyKeyboardMarkup(resize_keyboard=True)
    kb.add(KeyboardButton("🏠 Asosiy menyu"))
    kb.add(KeyboardButton("ℹ️ Ma'lumot"), KeyboardButton("📞 Aloqa"))
    return kb


'''


def generate_message_handler(data: dict) -> str:
    trigger = data.get("trigger", "/help")
    message = data.get("message", "Salom!").replace('"', '\\"')
    return f'''
@dp.message_handler(commands=["{trigger.lstrip('/')}"])
async def handler_{trigger.lstrip('/').replace('-', '_')}(message: types.Message):
    await message.answer("{message}")
'''


def generate_keyword_handler(data: dict) -> str:
    keyword = data.get("keyword", "salom").replace('"', '\\"')
    reply = data.get("reply", "Javob!").replace('"', '\\"')
    return f'''
@dp.message_handler(lambda msg: "{keyword}".lower() in msg.text.lower())
async def keyword_{keyword.replace(' ', '_')[:20]}(message: types.Message):
    await message.answer("{reply}")
'''


def generate_button_handler(data: dict) -> str:
    button_text = data.get("button", "Tugma").replace('"', '\\"')
    response = data.get("response", "Bosdingiz!").replace('"', '\\"')
    return f'''
@dp.message_handler(lambda msg: msg.text == "{button_text}")
async def btn_{button_text.replace(' ', '_')[:20]}(message: types.Message):
    await message.answer("{response}")
'''


def generate_inline_handler(data: dict) -> str:
    callback = data.get("callback", "btn1")
    text = data.get("text", "Inline tugma bosildi!").replace('"', '\\"')
    return f'''
@dp.callback_query_handler(lambda c: c.data == "{callback}")
async def inline_{callback}(callback_query: types.CallbackQuery):
    await callback_query.answer()
    await callback_query.message.answer("{text}")
'''


def generate_webapp_handler(data: dict) -> str:
    webapp_url = data.get("url", "https://example.com")
    button_text = data.get("button_text", "🌐 Web App ochish")
    return f'''
@dp.message_handler(commands=["webapp"])
async def open_webapp(message: types.Message):
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton(
        "{button_text}",
        web_app=types.WebAppInfo(url="{webapp_url}")
    ))
    await message.answer("Quyidagi tugmani bosing:", reply_markup=kb)
'''


def generate_bot_footer() -> str:
    return '''
@dp.message_handler()
async def default_handler(message: types.Message):
    await message.answer(
        "❓ Bu buyruq tushunarsiz.\\n\\n"
        "Yordam uchun /help buyrug'ini yuboring."
    )


async def main():
    logger.info("Bot ishga tushdi...")
    await dp.start_polling()


if __name__ == "__main__":
    asyncio.run(main())
'''


def generate_default_bot(token: str) -> str:
    """Scratch kodi yo'q bo'lganda standart bot"""
    return generate_bot_header(token) + '''
@dp.message_handler()
async def echo(message: types.Message):
    await message.answer(f"Siz yozdingiz: {message.text}")

''' + generate_bot_footer()


def validate_scratch_code(scratch_code: str) -> tuple[bool, str]:
    """Scratch kodini tekshirish"""
    if not scratch_code:
        return True, "Bo'sh kod (standart bot yaratiladi)"
    try:
        blocks = json.loads(scratch_code)
        if not isinstance(blocks, list):
            return False, "Kod massiv (list) bo'lishi kerak"
        valid_types = {"send_message", "keyword_reply", "button_menu", "inline_button", "webapp"}
        for i, block in enumerate(blocks):
            if "type" not in block:
                return False, f"Blok {i+1}: 'type' maydoni yo'q"
            if block["type"] not in valid_types:
                return False, f"Blok {i+1}: noma'lum tur '{block['type']}'"
        return True, f"{len(blocks)} ta blok topildi"
    except json.JSONDecodeError as e:
        return False, f"JSON xatosi: {e}"
