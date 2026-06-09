"""
To'lov tizimlari: Paystack va USDT TRC20
"""
import requests
import logging
import hashlib
import time
from config import (
    PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL,
    USDT_WALLET, PREMIUM_PRICE_USD
)

logger = logging.getLogger(__name__)


class PaystackManager:
    """Paystack orqali karta to'lovi"""

    def __init__(self):
        self.secret_key = PAYSTACK_SECRET_KEY
        self.base_url = PAYSTACK_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    def initialize_transaction(self, email: str, amount_usd: float, metadata: dict = None) -> dict:
        """To'lovni boshlash - payment link olish"""
        try:
            # Paystack centda ishlaydi
            amount_kobo = int(amount_usd * 100)

            payload = {
                "email": email,
                "amount": amount_kobo,
                "currency": "USD",
                "metadata": metadata or {},
                "callback_url": "https://your-botforge.onrender.com/payment/callback"
            }

            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                json=payload,
                headers=self.headers
            )

            data = response.json()
            if data.get("status"):
                return {
                    "success": True,
                    "payment_url": data["data"]["authorization_url"],
                    "reference": data["data"]["reference"]
                }
            else:
                return {"success": False, "error": data.get("message", "Noma'lum xato")}

        except Exception as e:
            logger.error(f"Paystack initialize error: {e}")
            return {"success": False, "error": str(e)}

    def verify_transaction(self, reference: str) -> dict:
        """To'lovni tekshirish"""
        try:
            response = requests.get(
                f"{self.base_url}/transaction/verify/{reference}",
                headers=self.headers
            )

            data = response.json()
            if data.get("status") and data["data"]["status"] == "success":
                return {
                    "success": True,
                    "amount": data["data"]["amount"] / 100,
                    "reference": reference
                }
            return {"success": False, "error": "To'lov tasdiqlanmadi"}

        except Exception as e:
            logger.error(f"Paystack verify error: {e}")
            return {"success": False, "error": str(e)}


class USDTManager:
    """USDT TRC20 to'lov"""

    def __init__(self):
        self.wallet = USDT_WALLET
        self.network = "TRC20"
        self.tron_api = "https://api.trongrid.io"

    def get_payment_info(self, user_id: int, amount: float) -> dict:
        """To'lov ma'lumotlarini olish"""
        # Unique transaction ID yaratish
        transaction_id = f"USDT_{user_id}_{int(time.time())}"

        return {
            "wallet": self.wallet,
            "amount": amount,
            "network": self.network,
            "transaction_id": transaction_id,
            "instructions": (
                f"1. {amount} USDT yuboring\n"
                f"2. Network: {self.network}\n"
                f"3. Manzil: {self.wallet}\n"
                f"4. Transaction hash ni yuboring\n"
                f"5. ID: {transaction_id}"
            )
        }

    def verify_transaction(self, tx_hash: str, expected_amount: float) -> dict:
        """USDT tranzaksiyasini Tron blockchain da tekshirish"""
        try:
            response = requests.get(
                f"{self.tron_api}/v1/transactions/{tx_hash}",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                # Tranzaksiya muvaffaqiyatli bo'lsa
                if data.get("ret", [{}])[0].get("contractRet") == "SUCCESS":
                    return {"success": True, "tx_hash": tx_hash}

            return {"success": False, "error": "Tranzaksiya topilmadi"}

        except Exception as e:
            logger.error(f"USDT verify error: {e}")
            return {"success": False, "error": str(e)}


def generate_transaction_id(user_id: int, method: str) -> str:
    """Unique transaction ID yaratish"""
    data = f"{user_id}_{method}_{time.time()}"
    return hashlib.md5(data.encode()).hexdigest()[:12].upper()


# Global instances
paystack = PaystackManager()
usdt = USDTManager()
