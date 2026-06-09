import logging
from aiogram import Bot, Dispatcher, types
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.utils import executor

from config import MAIN_BOT_TOKEN
from start import cmd_start, cmd_help
from create_bot import cmd_new_bot, process_bot_creation, create_bot_from_webapp
from my_bots import cmd_my_bots
from subscription import cmd_subscribe, process_paystack, process_usdt, confirm_payment
from channel_manager import cmd_manage_channels, add_channel_command, add_channel_process, list_channels
from admin_panel import show_stats, approve_payment

logging.basicConfig(level=logging.INFO)

bot = Bot(token=MAIN_BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)
dp.middleware.setup(LoggingMiddleware())

# ========== ODDIY BUYRUQLAR ==========
@dp.message_handler(commands=['start'])
async def start_command(message: types.Message):
    await cmd_start(message)

@dp.message_handler(commands=['help'])
async def help_command(message: types.Message):
    await cmd_help(message)

@dp.message_handler(commands=['newbot'])
async def newbot_command(message: types.Message):
    await cmd_new_bot(message)

@dp.message_handler(commands=['mybots'])
async def mybots_command(message: types.Message):
    await cmd_my_bots(message)

@dp.message_handler(commands=['subscribe'])
async def subscribe_command(message: types.Message):
    await cmd_subscribe(message)

@dp.message_handler(commands=['channels'])
async def channels_command(message: types.Message):
    await cmd_manage_channels(message)

@dp.message_handler(commands=['add_channel'])
async def add_channel_command_handler(message: types.Message):
    await add_channel_command(message)

@dp.message_handler(commands=['confirm_payment'])
async def confirm_payment_handler(message: types.Message):
    await confirm_payment(message)

# ========== ADMIN BUYRUQLARI ==========
@dp.message_handler(commands=['stats'])
async def admin_stats(message: types.Message):
    await show_stats(message)

@dp.message_handler(commands=['approve_payment'])
async def approve_payment_handler(message: types.Message):
    await approve_payment(message)

# ========== WEBAPP HANDLER ==========
@dp.message_handler(content_types=['web_app_data'])
async def web_app_data_handler(message: types.Message):
    import json
    data = json.loads(message.web_app_data.data)
    
    if data.get('action') == 'create_bot':
        await create_bot_from_webapp(
            message, 
            data['bot_name'],
            data['bot_username'],
            data['bot_type'],
            data['scratch_code']
        )
    
    await message.answer("✅ Amal bajarildi!")

# ========== CALLBACK QUERY HANDLERS ==========
@dp.callback_query_handler(lambda c: c.data.startswith('create_'))
async def create_bot_callback(callback_query: types.CallbackQuery):
    await process_bot_creation(callback_query)

@dp.callback_query_handler(lambda c: c.data == 'pay_paystack')
async def pay_paystack_callback(callback_query: types.CallbackQuery):
    await process_paystack(callback_query)

@dp.callback_query_handler(lambda c: c.data == 'pay_usdt')
async def pay_usdt_callback(callback_query: types.CallbackQuery):
    await process_usdt(callback_query)

@dp.callback_query_handler(lambda c: c.data == 'add_channel')
async def add_channel_callback(callback_query: types.CallbackQuery):
    await add_channel_process(callback_query)

@dp.callback_query_handler(lambda c: c.data == 'list_channels')
async def list_channels_callback(callback_query: types.CallbackQuery):
    await list_channels(callback_query)

@dp.callback_query_handler(lambda c: c.data == 'back_to_menu')
async def back_to_menu(callback_query: types.CallbackQuery):
    await cmd_start(callback_query.message)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
