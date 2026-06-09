"""
Premium obuna tizimi - Paystack va USDT
"""
from aiogram import types
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from config import PREMIUM_PRICE_USD, USDT_WALLET, ADMIN_IDS, PREMIUM_BOT_LIMIT
from utils.sheet_manager import sheet
from utils.payment import paystack, usdt, generate_transaction_id


class PaymentStates(StatesGroup):
    waiting_usdt_hash = State()
    waiting_email = State()


async def cmd_subscribe(message: types.Message):
    await show_premium(message.from_user.id, message)


async def callback_premium(callback: types.CallbackQuery):
    await show_premium(callback.from_user.id, callback.message, edit=True)
    await callback.answer()


async def show_premium(user_id: int, message: types.Message, edit: bool = False):
    """Premium sahifasini ko'rsatish"""
    is_prem = sheet.is_premium(user_id)

    if is_prem:
        db_user = sheet.get_user(user_id)
        premium_until = db_user.get("premium_until", "") if db_user else ""
        from datetime import datetime
        try:
            exp = datetime.fromisoformat(premium_until)
            exp_str = exp.strftime("%d.%m.%Y")
        except:
            exp_str = "Noma'lum"

        text = (
            "💎 <b>Premium obuna</b>\n\n"
            "✅ Siz allaqachon <b>Premium</b> foydalanuvchisiz!\n\n"
            f"📅 Muddati: <b>{exp_str}</b>\n\n"
            "🎁 <b>Premium imkoniyatlar:</b>\n"
            f"• {PREMIUM_BOT_LIMIT} tagacha bot yaratish\n"
            "• Kanal va guruhlarni boshqarish\n"
            "• Cheksiz xabar yuborish\n"
            "• Ustuvor texnik yordam"
        )
        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))
    else:
        text = (
            "💎 <b>Premium obuna</b>\n\n"
            f"💰 Narx: <b>${PREMIUM_PRICE_USD}/oyiga</b>\n\n"
            "🎁 <b>Premium imkoniyatlar:</b>\n"
            f"• {PREMIUM_BOT_LIMIT} tagacha bot yaratish\n"
            "• Kanal va guruhlarni boshqarish\n"
            "• Cheksiz xabar yuborish\n"
            "• Ustuvor texnik yordam\n\n"
            "💳 <b>To'lov usulini tanlang:</b>"
        )
        kb = InlineKeyboardMarkup(row_width=1)
        kb.add(
            InlineKeyboardButton("💳 Karta orqali (Paystack)", callback_data="pay_card"),
            InlineKeyboardButton("🔰 USDT TRC20", callback_data="pay_usdt")
        )
        kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))

    if edit:
        await message.edit_text(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


async def callback_pay_card(callback: types.CallbackQuery, state: FSMContext):
    """Karta orqali to'lov"""
    await PaymentStates.waiting_email.set()

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_payment"))

    await callback.message.edit_text(
        "💳 <b>Karta orqali to'lov</b>\n\n"
        "📧 Elektron pochta manzilingizni yuboring:\n"
        "<i>To'lov cheki shu manzilga yuboriladi</i>",
        reply_markup=kb
    )
    await callback.answer()


async def process_email(message: types.Message, state: FSMContext):
    """Email manzilini qayta ishlash"""
    email = message.text.strip()

    # Email tekshirish
    import re
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        await message.answer("❌ Noto'g'ri email format! Qayta yuboring:")
        return

    user_id = message.from_user.id
    transaction_id = generate_transaction_id(user_id, "card")

    # Paystack orqali to'lov linki olish
    result = paystack.initialize_transaction(
        email=email,
        amount_usd=PREMIUM_PRICE_USD,
        metadata={"user_id": user_id, "transaction_id": transaction_id}
    )

    if result["success"]:
        # To'lovni bazaga saqlash
        sheet.create_payment(
            user_id=user_id,
            amount=PREMIUM_PRICE_USD,
            payment_method="paystack",
            transaction_id=transaction_id
        )

        kb = InlineKeyboardMarkup()
        kb.add(InlineKeyboardButton("💳 To'lovga o'tish", url=result["payment_url"]))
        kb.add(InlineKeyboardButton("✅ To'lovni tasdiqladim", callback_data=f"verify_card:{transaction_id}"))
        kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_payment"))

        await message.answer(
            f"💳 <b>To'lov havolasi tayyor!</b>\n\n"
            f"💰 Summa: ${PREMIUM_PRICE_USD}\n"
            f"📧 Email: {email}\n"
            f"🔑 ID: <code>{transaction_id}</code>\n\n"
            "To'lovni amalga oshiring va 'Tasdiqladim' ni bosing:",
            reply_markup=kb
        )
    else:
        await message.answer(
            f"❌ To'lov tizimida xato: {result.get('error', 'Noma\\'lum xato')}\n\n"
            "USDT orqali to'lashga urinib ko'ring: /subscribe"
        )

    await state.finish()


async def callback_pay_usdt(callback: types.CallbackQuery, state: FSMContext):
    """USDT orqali to'lov"""
    user_id = callback.from_user.id
    payment_info = usdt.get_payment_info(user_id, PREMIUM_PRICE_USD)

    # To'lovni bazaga saqlash
    sheet.create_payment(
        user_id=user_id,
        amount=PREMIUM_PRICE_USD,
        payment_method="usdt",
        transaction_id=payment_info["transaction_id"]
    )

    await PaymentStates.waiting_usdt_hash.set()
    await state.update_data(transaction_id=payment_info["transaction_id"])

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("📋 Manzilni nusxalash",
                                 callback_data=f"copy_wallet"))
    kb.add(InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_payment"))

    await callback.message.edit_text(
        f"🔰 <b>USDT TRC20 orqali to'lov</b>\n\n"
        f"💰 Summa: <b>{PREMIUM_PRICE_USD} USDT</b>\n"
        f"🌐 Network: <b>TRC20</b>\n\n"
        f"📬 <b>Wallet manzili:</b>\n"
        f"<code>{USDT_WALLET}</code>\n\n"
        f"📋 ID: <code>{payment_info['transaction_id']}</code>\n\n"
        f"⚠️ <b>Muhim:</b>\n"
        f"1. Aynan {PREMIUM_PRICE_USD} USDT yuboring\n"
        f"2. Faqat TRC20 network!\n"
        f"3. Transaction hash ni menga yuboring\n\n"
        f"👇 Transaction hash ni kiriting (txid):",
        reply_markup=kb
    )
    await callback.answer()


async def process_usdt_hash(message: types.Message, state: FSMContext):
    """USDT transaction hash ni qayta ishlash"""
    tx_hash = message.text.strip()
    user_id = message.from_user.id
    data = await state.get_data()
    transaction_id = data.get("transaction_id", "")

    # Hash uzunligini tekshirish (Tron hash = 64 belgi)
    if len(tx_hash) < 60:
        await message.answer(
            "❌ Noto'g'ri transaction hash!\n"
            "Tron blockchain dan to'g'ri txid ni yuboring.\n"
            "(64 belgidan iborat bo'lishi kerak)"
        )
        return

    # Adminga xabar yuborish
    for admin_id in ADMIN_IDS:
        try:
            kb = InlineKeyboardMarkup(row_width=2)
            kb.add(
                InlineKeyboardButton("✅ Tasdiqlash",
                                     callback_data=f"approve:{transaction_id}:{user_id}"),
                InlineKeyboardButton("❌ Rad etish",
                                     callback_data=f"reject:{transaction_id}:{user_id}")
            )
            await message.bot.send_message(
                admin_id,
                f"💰 <b>USDT To'lov!</b>\n\n"
                f"👤 User: {message.from_user.mention}\n"
                f"🆔 ID: {user_id}\n"
                f"💵 Summa: {PREMIUM_PRICE_USD} USDT\n"
                f"🔑 Transaction ID: <code>{transaction_id}</code>\n"
                f"📋 TxHash: <code>{tx_hash}</code>\n\n"
                f"🔗 Tekshirish: https://tronscan.org/#/transaction/{tx_hash}",
                reply_markup=kb
            )
        except:
            pass

    await state.finish()
    await message.answer(
        "⏳ <b>To'lovingiz yuborildi!</b>\n\n"
        "Admin tekshirib, 30 daqiqa ichida tasdiqlaydi.\n"
        "Tasdiqlangandan so'ng sizga xabar keladi."
    )


async def callback_verify_card(callback: types.CallbackQuery):
    """Karta to'lovini tekshirish"""
    transaction_id = callback.data.split(":")[1]
    user_id = callback.from_user.id

    payment = sheet.get_payment(transaction_id)
    if not payment:
        await callback.answer("To'lov topilmadi!", show_alert=True)
        return

    if payment.get("status") == "approved":
        await callback.answer("✅ Allaqachon tasdiqlangan!", show_alert=True)
        return

    # Paystack dan tekshirish
    ref = transaction_id
    result = paystack.verify_transaction(ref)

    if result.get("success"):
        sheet.approve_payment(transaction_id)
        sheet.activate_premium(user_id)

        await callback.message.edit_text(
            "🎉 <b>To'lov tasdiqlandi!</b>\n\n"
            "💎 Premium obuna faollashtirildi!\n"
            "Endi 10 tagacha bot yaratishingiz mumkin.\n\n"
            "/start - Bosh menyuga qaytish"
        )
    else:
        await callback.answer(
            "⏳ To'lov hali tasdiqlanmagan. Biroz kuting.",
            show_alert=True
        )


async def callback_cancel_payment(callback: types.CallbackQuery, state: FSMContext):
    """To'lovni bekor qilish"""
    await state.finish()
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("⬅️ Orqaga", callback_data="main_menu"))
    await callback.message.edit_text("❌ To'lov bekor qilindi.", reply_markup=kb)
    await callback.answer()


def register_handlers(dp):
    dp.register_message_handler(cmd_subscribe, commands=["subscribe"])
    dp.register_callback_query_handler(callback_premium, lambda c: c.data == "premium")
    dp.register_callback_query_handler(callback_pay_card, lambda c: c.data == "pay_card",
                                        state="*")
    dp.register_callback_query_handler(callback_pay_usdt, lambda c: c.data == "pay_usdt",
                                        state="*")
    dp.register_message_handler(process_email, state=PaymentStates.waiting_email)
    dp.register_message_handler(process_usdt_hash, state=PaymentStates.waiting_usdt_hash)
    dp.register_callback_query_handler(callback_verify_card,
                                        lambda c: c.data.startswith("verify_card:"))
    dp.register_callback_query_handler(callback_cancel_payment,
                                        lambda c: c.data == "cancel_payment", state="*")
