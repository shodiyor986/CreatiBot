import json
import os
from datetime import datetime

# Faylda saqlash uchun oddiy funksiyalar
DATA_FILE = "bot_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"users": [], "bots": [], "channels": [], "payments": []}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

class SheetManager:
    def __init__(self):
        self.data = load_data()
    
    def add_user(self, telegram_id, username, first_name):
        user = {
            "telegram_id": str(telegram_id),
            "username": username or "",
            "first_name": first_name or "",
            "created_at": datetime.now().isoformat(),
            "is_premium": "FALSE",
            "premium_until": "",
            "bots_created": 0
        }
        self.data["users"].append(user)
        save_data(self.data)
        return True
    
    def get_user(self, telegram_id):
        for user in self.data["users"]:
            if user["telegram_id"] == str(telegram_id):
                return user
        return None
    
    def save_bot(self, bot_data):
        bot_data["created_at"] = datetime.now().isoformat()
        self.data["bots"].append(bot_data)
        save_data(self.data)
        return True
    
    def get_user_bots(self, owner_id):
        return [b for b in self.data["bots"] if b["owner_id"] == owner_id]
    
    def add_channel(self, user_id, channel_id, channel_name, channel_type):
        channel = {
            "user_id": str(user_id),
            "channel_id": channel_id,
            "channel_name": channel_name,
            "channel_type": channel_type,
            "added_at": datetime.now().isoformat(),
            "is_active": "TRUE"
        }
        self.data["channels"].append(channel)
        save_data(self.data)
        return True
    
    def get_user_channels(self, user_id):
        return [c for c in self.data["channels"] if c["user_id"] == str(user_id)]
    
    def add_payment(self, user_id, amount, payment_method, transaction_id):
        payment = {
            "user_id": str(user_id),
            "amount": amount,
            "payment_method": payment_method,
            "transaction_id": transaction_id,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        self.data["payments"].append(payment)
        save_data(self.data)
        return True
    
    def verify_payment(self, transaction_id):
        for p in self.data["payments"]:
            if p["transaction_id"] == transaction_id:
                p["status"] = "completed"
                save_data(self.data)
                return True
        return False
    
    def get_stats(self):
        return {
            "total_users": len(self.data["users"]),
            "total_bots": len(self.data["bots"]),
            "premium_users": len([u for u in self.data["users"] if u.get("is_premium") == "TRUE"]),
            "total_income": sum([int(p.get("amount", 0)) for p in self.data["payments"] if p.get("status") == "completed"])
        }
