// To'lov integratsiyasi uchun demo manzillar
function redirectToPayme() {
    let amount = 150000; // So'mdagi qiymat (masalan, 15$ ekvivalenti)
    let paymeDemoUrl = `https://checkout.paycom.uz/https://sizning-domeningiz.uz/pay-success?user_id=${userId}&amount=${amount}`;
    
    // Telegram tashqi brauzerida ochish
    window.open(paymeDemoUrl, "_blank");
}

function redirectToClick() {
    let clickDemoUrl = `https://my.click.uz/services/pay?service_id=12345&merchant_id=6789&amount=15.00&transaction_param=${userId}`;
    
    window.open(clickDemoUrl, "_blank");
}

// To'lov muvaffaqiyatli o'tgandan so'ng serveringiz (Webhook) chaqiradigan API mantiqi (Demo g'oya):
// Bu qism backend serverda bajariladi va foydalanuvchining 'plan_expires' muddatini +30 kunga cho'zadi.
