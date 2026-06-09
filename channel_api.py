from aiogram import Bot
from config import MAIN_BOT_TOKEN

class ChannelManager:
    def __init__(self):
        self.bot = Bot(token=MAIN_BOT_TOKEN)
    
    async def get_channel_info(self, channel_input):
        """Kanal ma'lumotlarini olish"""
        try:
            chat = await self.bot.get_chat(channel_input)
            return {
                'id': chat.id,
                'title': chat.title,
                'username': chat.username,
                'type': 'channel' if chat.type == 'channel' else 'group'
            }
        except Exception as e:
            print(f"Kanal topilmadi: {e}")
            return None
    
    async def send_message(self, channel_id, text):
        """Kanalga xabar yuborish"""
        try:
            await self.bot.send_message(channel_id, text)
            return True
        except:
            return False
