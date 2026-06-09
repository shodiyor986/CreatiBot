"""
SheetDB va Google Sheets bilan ishlash uchun utility
"""
import requests
import logging
from datetime import datetime
from config import SHEETDB_URL

logger = logging.getLogger(__name__)


class SheetManager:
    def __init__(self, base_url=SHEETDB_URL):
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}

    # ============================================
    # UNIVERSAL METODLAR
    # ============================================

    def get_all(self, sheet: str) -> list:
        """Varaqdan barcha ma'lumotlarni olish"""
        try:
            response = requests.get(f"{self.base_url}?sheet={sheet}", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"get_all error ({sheet}): {e}")
            return []

    def search(self, sheet: str, column: str, value: str) -> list:
        """Qidiruv"""
        try:
            response = requests.get(
                f"{self.base_url}/search?sheet={sheet}&{column}={value}",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"search error ({sheet}): {e}")
            return []

    def insert(self, sheet: str, data: dict) -> bool:
        """Yangi qator qo'shish"""
        try:
            response = requests.post(
                f"{self.base_url}?sheet={sheet}",
                json={"data": [data]},
                headers=self.headers
            )
            return response.status_code == 201
        except Exception as e:
            logger.error(f"insert error ({sheet}): {e}")
            return False

    def update(self, sheet: str, column: str, value: str, new_data: dict) -> bool:
        """Ma'lumotni yangilash"""
        try:
            response = requests.patch(
                f"{self.base_url}/{column}/{value}?sheet={sheet}",
                json={"data": new_data},
                headers=self.headers
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"update error ({sheet}): {e}")
            return False

    def delete(self, sheet: str, column: str, value: str) -> bool:
        """Qatorni o'chirish"""
        try:
            response = requests.delete(
                f"{self.base_url}/{column}/{value}?sheet={sheet}",
                headers=self.headers
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"delete error ({sheet}): {e}")
            return False

    # ============================================
    # FOYDALANUVCHILAR
    # ============================================

    def get_user(self, telegram_id: int) -> dict | None:
        """Foydalanuvchini ID bo'yicha topish"""
        results = self.search("users", "telegram_id", str(telegram_id))
        return results[0] if results else None

    def create_user(self, telegram_id: int, username: str, first_name: str) -> bool:
        """Yangi foydalanuvchi yaratish"""
        existing = self.get_user(telegram_id)
        if existing:
            return True  # Allaqachon bor

        data = {
            "telegram_id": str(telegram_id),
            "username": username or "",
            "first_name": first_name or "",
            "created_at": datetime.now().isoformat(),
            "is_premium": "false",
            "premium_until": "",
            "bots_created": "0"
        }
        return self.insert("users", data)

    def is_premium(self, telegram_id: int) -> bool:
        """Foydalanuvchi premium ekanligini tekshirish"""
        user = self.get_user(telegram_id)
        if not user:
            return False
        if user.get("is_premium") != "true":
            return False
        # Muddatini tekshirish
        premium_until = user.get("premium_until", "")
        if premium_until:
            try:
                expiry = datetime.fromisoformat(premium_until)
                if datetime.now() > expiry:
                    # Muddati o'tgan - premium ni o'chirish
                    self.update("users", "telegram_id", str(telegram_id), {"is_premium": "false"})
                    return False
            except:
                pass
        return True

    def get_user_bot_count(self, telegram_id: int) -> int:
        """Foydalanuvchining botlar sonini olish"""
        bots = self.search("bots", "owner_id", str(telegram_id))
        active_bots = [b for b in bots if b.get("status") != "deleted"]
        return len(active_bots)

    def activate_premium(self, telegram_id: int, days: int = 30) -> bool:
        """Premium faollashtirish"""
        from datetime import timedelta
        expiry = (datetime.now() + timedelta(days=days)).isoformat()
        return self.update("users", "telegram_id", str(telegram_id), {
            "is_premium": "true",
            "premium_until": expiry
        })

    # ============================================
    # BOTLAR
    # ============================================

    def get_user_bots(self, telegram_id: int) -> list:
        """Foydalanuvchining botlarini olish"""
        bots = self.search("bots", "owner_id", str(telegram_id))
        return [b for b in bots if b.get("status") != "deleted"]

    def create_bot(self, token: str, name: str, username: str,
                   owner_id: int, bot_type: str, scratch_code: str = "") -> bool:
        """Yangi bot yaratish"""
        data = {
            "token": token,
            "name": name,
            "username": username,
            "owner_id": str(owner_id),
            "bot_type": bot_type,
            "scratch_code": scratch_code,
            "status": "active",
            "created_at": datetime.now().isoformat()
        }
        return self.insert("bots", data)

    def get_bot(self, token: str) -> dict | None:
        """Bot tokeniga qarab topish"""
        results = self.search("bots", "token", token)
        return results[0] if results else None

    def update_bot_status(self, token: str, status: str) -> bool:
        """Bot holatini yangilash (active/stopped/deleted)"""
        return self.update("bots", "token", token, {"status": status})

    def update_bot_code(self, token: str, scratch_code: str) -> bool:
        """Bot kodini yangilash"""
        return self.update("bots", "token", token, {"scratch_code": scratch_code})

    # ============================================
    # KANALLAR
    # ============================================

    def get_user_channels(self, user_id: int) -> list:
        """Foydalanuvchining kanallarini olish"""
        channels = self.search("channels", "user_id", str(user_id))
        return [c for c in channels if c.get("is_active") != "false"]

    def add_channel(self, user_id: int, channel_id: str,
                    channel_name: str, channel_type: str = "channel") -> bool:
        """Kanal qo'shish"""
        data = {
            "user_id": str(user_id),
            "channel_id": channel_id,
            "channel_name": channel_name,
            "channel_type": channel_type,
            "added_at": datetime.now().isoformat(),
            "is_active": "true"
        }
        return self.insert("channels", data)

    def remove_channel(self, user_id: int, channel_id: str) -> bool:
        """Kanalni o'chirish"""
        return self.update("channels", "channel_id", channel_id, {"is_active": "false"})

    # ============================================
    # TO'LOVLAR
    # ============================================

    def create_payment(self, user_id: int, amount: float,
                       payment_method: str, transaction_id: str) -> bool:
        """To'lov yaratish"""
        data = {
            "user_id": str(user_id),
            "amount": str(amount),
            "payment_method": payment_method,
            "transaction_id": transaction_id,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        return self.insert("payments", data)

    def get_pending_payments(self) -> list:
        """Tasdiqlanmagan to'lovlar"""
        return self.search("payments", "status", "pending")

    def approve_payment(self, transaction_id: str) -> bool:
        """To'lovni tasdiqlash"""
        return self.update("payments", "transaction_id", transaction_id, {"status": "approved"})

    def get_payment(self, transaction_id: str) -> dict | None:
        """To'lovni topish"""
        results = self.search("payments", "transaction_id", transaction_id)
        return results[0] if results else None

    # ============================================
    # STATISTIKA
    # ============================================

    def get_stats(self) -> dict:
        """Umumiy statistika"""
        users = self.get_all("users")
        bots = self.get_all("bots")
        payments = self.get_all("payments")

        premium_users = [u for u in users if u.get("is_premium") == "true"]
        approved_payments = [p for p in payments if p.get("status") == "approved"]
        total_revenue = sum(float(p.get("amount", 0)) for p in approved_payments)

        return {
            "total_users": len(users),
            "premium_users": len(premium_users),
            "total_bots": len(bots),
            "total_payments": len(approved_payments),
            "total_revenue": total_revenue
        }


# Global instance
sheet = SheetManager()
