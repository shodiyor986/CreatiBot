import requests
import json
from datetime import datetime
from config import SHEETDB_API_URL, GOOGLE_SHEET_ID

class SheetManager:
    def __init__(self):
        self.api_url = SHEETDB_API_URL
    
    # ========== USERS ==========
    def add_user(self, telegram_id, username, first_name):
        """Yangi foydalanuvchi qo'shish"""
        data = {
            "telegram_id": str(telegram_id),
            "username": username or "",
            "first_name": first_name or "",
            "created_at": datetime.now().isoformat(),
            "is_premium": "FALSE",
            "premium_until": "",
            "bots_created": "0"
        }
        
        response = requests.post(
            self.api_url,
            headers={"Content-Type": "application/json"},
            json=data
        )
        return response.status_code in [200, 201]
    
    def get_user(self, telegram_id):
        """Foydalanuvchi ma'lumotlarini olish"""
        response = requests.get(f"{self.api_url}/telegram_id/{telegram_id}")
        if response.status_code == 200:
            data = response.json()
            return data[0] if data and len(data) > 0 else None
        return None
    
    # ========== BOTS ==========
    def save_bot(self, bot_data):
        """Yangi botni saqlash"""
        response = requests.post(
            f"{self.api_url}/bots",
            json=bot_data
        )
        return response.status_code in [200, 201]
    
    def get_user_bots(self, owner_id):
        """Foydalanuvchining barcha botlari"""
        response = requests.get(f"{self.api_url}/bots/owner_id/{owner_id}")
        if response.status_code == 200:
            return response.json()
        return []
    
    # ========== CHANNELS ==========
    def add_channel(self, user_id, channel_id, channel_name, channel_type):
        """Boshqariladigan kanal/guruh qo'shish"""
        data = {
            "user_id": str(user_id),
            "channel_id": channel_id,
            "channel_name": channel_name,
            "channel_type": channel_type,
            "added_at": datetime.now().isoformat(),
            "is_active": "TRUE"
        }
        
        response = requests.post(
            f"{self.api_url}/channels",
            json=data
        )
        return response.status_code in [200, 201]
    
    def get_user_channels(self, user_id):
        """Foydalanuvchining barcha kanal/guruhlari"""
        response = requests.get(f"{self.api_url}/channels/user_id/{user_id}")
        if response.status_code == 200:
            return response.json()
        return []
    
    # ========== PAYMENTS ==========
    def add_payment(self, user_id, amount, payment_method, transaction_id):
        """To'lovni saqlash"""
        data = {
            "user_id": str(user_id),
            "amount": str(amount),
            "payment_method": payment_method,
            "transaction_id": transaction_id,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        response = requests.post(
            f"{self.api_url}/payments",
            json=data
        )
        return response.status_code in [200, 201]
    
    def verify_payment(self, transaction_id):
        """To'lovni tasdiqlash"""
        # SheetDB da yangilash (PUT yoki PATCH)
        response = requests.patch(
            f"{self.api_url}/payments/transaction_id/{transaction_id}",
            json={"status": "completed"}
        )
        return response.status_code == 200
    
    # ========== STATISTIKA ==========
    def get_stats(self):
        """Statistika olish"""
        try:
            users = requests.get(f"{self.api_url}/users").json()
            bots = requests.get(f"{self.api_url}/bots").json()
            payments = requests.get(f"{self.api_url}/payments").json()
            
            total_income = sum([int(p.get('amount', 0)) for p in payments if p.get('status') == 'completed'])
            premium_users = len([u for u in users if u.get('is_premium') == "TRUE"])
            
            return {
                "total_users": len(users),
                "total_bots": len(bots),
                "premium_users": premium_users,
                "total_income": total_income
            }
        except:
            return {
                "total_users": 0,
                "total_bots": 0,
                "premium_users": 0,
                "total_income": 0
            }
