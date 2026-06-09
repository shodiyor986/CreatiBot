"""
BotForge - Asosiy bot fayli
GitHub ga yuklab, Render.com da ishlatish uchun
"""
import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.utils import executor

from config import MAIN_BOT_TOKEN, WEBAPP_URL
from handlers import register_all_handlers

# Logging sozlash
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('botforge.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Bot va Dispatcher yaratish
bot = Bot(token=MAIN_BOT_TOKEN, parse_mode="HTML")
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)


async def on_startup(dispatcher: Dispatcher):
    """Bot ishga tushganda"""
    logger.info("🚀 BotForge ishga tushdi!")

    # Bot ma'lumotlarini olish
    try:
        bot_info = await bot.get_me()
        logger.info(f"Bot: @{bot_info.username} ({bot_info.full_name})")
    except Exception as e:
        logger.error(f"Bot info olishda xato: {e}")

    # Handlerlarni ro'yxatdan o'tkazish
    register_all_handlers(dispatcher)
    logger.info("✅ Barcha handlerlar ro'yxatdan o'tdi")


async def on_shutdown(dispatcher: Dispatcher):
    """Bot to'xtaganda"""
    logger.info("🛑 BotForge to'xtadi")
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()


# ============================================
# WEBHOOK (Render.com uchun) yoki POLLING
# ============================================

# Render.com da deploy qilish uchun webhook ishlatish tavsiya etiladi
# Lokal test uchun polling yetarli

def main():
    """Asosiy funksiya"""
    import os

    # Render.com yoki boshqa platformada bo'lsa
    webhook_url = os.environ.get("WEBHOOK_URL", "")

    if webhook_url:
        # Webhook mode
        logger.info(f"Webhook mode: {webhook_url}")
        from aiohttp import web

        async def setup_webhook():
            await bot.set_webhook(url=f"{webhook_url}/webhook")

        asyncio.run(setup_webhook())

        executor.start_webhook(
            dispatcher=dp,
            webhook_path="/webhook",
            on_startup=on_startup,
            on_shutdown=on_shutdown,
            host="0.0.0.0",
            port=int(os.environ.get("PORT", 8080))
        )
    else:
        # Polling mode (lokal test uchun)
        logger.info("Polling mode")
        executor.start_polling(
            dp,
            on_startup=on_startup,
            on_shutdown=on_shutdown,
            skip_updates=True
        )


if __name__ == "__main__":
    main()
