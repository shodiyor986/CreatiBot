import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor

# TOKENINGIZNI QO'YING!
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # <<<<<< BU YERGA O'Z TOKENINGIZNI YOZING

logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    await message.answer(
        "🤖 Bot ishlamoqda!\n\n"
        "To'liq versiya uchun /help bosing."
    )

@dp.message_handler(commands=['help'])
async def help(message: types.Message):
    await message.answer(
        "Buyruqlar:\n"
        "/start - Boshlash\n"
        "/help - Yordam\n\n"
        "To'liq bot tez kunda!"
    )

@dp.message_handler()
async def echo(message: types.Message):
    await message.answer(f"Siz yozdingiz: {message.text}")

if __name__ == '__main__':
    print("Bot ishga tushdi...")
    executor.start_polling(dp, skip_updates=True)
