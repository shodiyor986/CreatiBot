import requests
import json
from config import PAYSTACK_SECRET_KEY

class PaymentProcessor:
    def __init__(self):
        self.secret_key = PAYSTACK_SECRET_KEY
        self.base_url = "https://api.paystack.co"
    
    def create_paystack_payment(self, email, amount, user_id):
        """Paystack to'lov link yaratish"""
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "email": email,
            "amount": amount,  # kopeck da (100 = 1$)
            "callback_url": f"https://your-bot.com/payment/callback",
            "metadata": {
                "user_id": user_id
            }
        }
        
        response = requests.post(
            f"{self.base_url}/transaction/initialize",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['data']['authorization_url']
        
        return None
    
    def verify_payment(self, reference):
        """To'lovni tekshirish"""
        headers = {
            "Authorization": f"Bearer {self.secret_key}"
        }
        
        response = requests.get(
            f"{self.base_url}/transaction/verify/{reference}",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['data']['status'] == 'success'
        
        return False
