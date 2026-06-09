"""
Telegram kanal va guruh API
"""
import aiohttp
import logging
from config import MAIN_BOT_TOKEN

logger = logging.getLogger(__name__)

TELEGRAM_API = f"https://api.telegram.org/bot{MAIN_BOT_TOKEN}"


async def send_message_to_channel(channel_id: str, text: str,
                                   parse_mode: str = "HTML") -> dict:
    """Kanalga xabar yuborish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": channel_id,
                "text": text,
                "parse_mode": parse_mode
            }) as resp:
                return await resp.json()
    except Exception as e:
        logger.error(f"send_message error: {e}")
        return {"ok": False, "error": str(e)}


async def get_chat_info(channel_id: str) -> dict:
    """Kanal ma'lumotlarini olish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{TELEGRAM_API}/getChat",
                                    params={"chat_id": channel_id}) as resp:
                data = await resp.json()
                if data.get("ok"):
                    return {
                        "success": True,
                        "title": data["result"].get("title", ""),
                        "type": data["result"].get("type", ""),
                        "username": data["result"].get("username", ""),
                        "members_count": data["result"].get("member_count", 0)
                    }
                return {"success": False, "error": data.get("description", "Xato")}
    except Exception as e:
        logger.error(f"get_chat_info error: {e}")
        return {"success": False, "error": str(e)}


async def get_channel_members_count(channel_id: str) -> int:
    """Kanal a'zolari sonini olish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{TELEGRAM_API}/getChatMemberCount",
                                    params={"chat_id": channel_id}) as resp:
                data = await resp.json()
                if data.get("ok"):
                    return data["result"]
                return 0
    except Exception as e:
        logger.error(f"get_members error: {e}")
        return 0


async def ban_user_from_channel(channel_id: str, user_id: int) -> bool:
    """Foydalanuvchini kanaldan ban qilish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{TELEGRAM_API}/banChatMember", json={
                "chat_id": channel_id,
                "user_id": user_id
            }) as resp:
                data = await resp.json()
                return data.get("ok", False)
    except Exception as e:
        logger.error(f"ban_user error: {e}")
        return False


async def unban_user_from_channel(channel_id: str, user_id: int) -> bool:
    """Ban ni ochish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{TELEGRAM_API}/unbanChatMember", json={
                "chat_id": channel_id,
                "user_id": user_id,
                "only_if_banned": True
            }) as resp:
                data = await resp.json()
                return data.get("ok", False)
    except Exception as e:
        logger.error(f"unban_user error: {e}")
        return False


async def pin_message(channel_id: str, message_id: int) -> bool:
    """Xabarni pin qilish"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{TELEGRAM_API}/pinChatMessage", json={
                "chat_id": channel_id,
                "message_id": message_id
            }) as resp:
                data = await resp.json()
                return data.get("ok", False)
    except Exception as e:
        logger.error(f"pin_message error: {e}")
        return False


async def check_bot_is_admin(channel_id: str) -> bool:
    """Bot adminda ekanligini tekshirish"""
    try:
        async with aiohttp.ClientSession() as session:
            # Bot ID ni olish
            async with session.get(f"{TELEGRAM_API}/getMe") as resp:
                me_data = await resp.json()
                if not me_data.get("ok"):
                    return False
                bot_id = me_data["result"]["id"]

            # Bot admin statusini tekshirish
            async with session.get(f"{TELEGRAM_API}/getChatMember",
                                    params={"chat_id": channel_id, "user_id": bot_id}) as resp:
                data = await resp.json()
                if data.get("ok"):
                    status = data["result"]["status"]
                    return status in ["administrator", "creator"]
                return False
    except Exception as e:
        logger.error(f"check_admin error: {e}")
        return False
