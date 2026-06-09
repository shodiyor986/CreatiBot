from aiogram import types
from sheet_manager import SheetManager
from config import ADMIN_IDS

sheet_manager = SheetManager()

async def show_stats(message: types.Message):
    """Statistika ko'rsatish (faqat admin)"""
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("❌ Siz admin emassiz!")
        return
    
    stats = sheet_manager.get_stats()
    
    text = f"""
📊 *BotForge Statistika*

👥 *Foydalanuvchilar:* {stats['total_users']}
🤖 *Yaratilgan botlar:* {stats['total_bots']}
🌟 *Premium foydalanuvchilar:* {stats['premium_users']}
💰 *Umumiy daromad:* ${stats['total_income']}

📈 *Oxirgi oy:* 
• Yangi foydalanuvchilar: -
• Yangi botlar: -
"""
    await message.answer(text, parse_mode="Markdown")

async def approve_payment(message: types.Message, txid: str):
    """To'lovni tasdiqlash (faqat admin)"""
    if message.from_user.id not in ADMIN_IDS:
        await message.answer("❌ Siz admin emassiz!")
        return
    
    if not txid:
        await message.answer("❌ TXID ni kiriting: /approve_payment [TXID]")
        return
    
    # To'lovni topish va tasdiqlash
    # (SheetDB da qidirish kerak)
    sheet_manager.verify_payment(txid)
    
    await message.answer(f"✅ To'lov tasdiqlandi! TXID: {txid}")
