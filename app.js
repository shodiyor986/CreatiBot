const SHEETDB_URL = "https://sheetdb.io/api/v1/53jj6rji62pdg";
let tg = window.Telegram.WebApp;
tg.expand(); // Web appni to'liq ekranga ochish

// Telegramdan foydalanuvchi ma'lumotlarini olish (agar bot ichida ochilgan bo'lsa)
let userId = tg.initDataUnsafe?.user?.id || "DEMO_USER_123"; 
let imgBbApiKey = ""; // Google Sheets'dan xavfsiz yuklanadi

document.getElementById("user-info").innerText = `Foydalanuvchi ID: ${userId}`;

// Sahifa yuklanganda obuna holatini va Configlarni tekshirish
async function initApp() {
    // 1. Config varog'idan ImgBB kalitini olish
    try {
        let configRes = await fetch(`${SHEETDB_URL}?sheet=Config`);
        let configData = await configRes.json();
        let config = {};
        configData.forEach(item => config[item.key] = item.value);
        imgBbApiKey = config["IMGBB_API"];
        
        // 2. Users varog'idan foydalanuvchini tekshirish
        let usersRes = await fetch(`${SHEETDB_URL}?sheet=Users`);
        let usersData = await usersRes.json();
        let currentUser = usersData.find(u => u.user_id == userId);

        if (currentUser) {
            document.getElementById("bot-token").value = currentUser.bot_token !== "Kiritilmagan" ? currentUser.bot_token : "";
            
            // Obuna muddatini tekshirish
            let expireDate = new Date(currentUser.plan_expires);
            let today = new Date();
            
            if (today > expireDate) {
                // Muddat tugagan bo'lsa bloklash
                document.getElementById("designer-panel").classList.add("hidden");
                document.getElementById("billing-section").classList.remove("hidden");
            }
        } else {
            // Yangi foydalanuvchini ro'yxatga olish (1 oy bepul)
            await registerNewUser();
        }
    } catch (e) {
        console.error("Xatolik yuz berdi:", e);
    }
}

// Yangi foydalanuvchini bazaga qo'shish
async function registerNewUser() {
    let today = new Date();
    let expireDate = new Date();
    expireDate.setDate(today.getDate() + 30); // 30 kun bepul

    let newUser = {
        data: [{
            user_id: userId,
            bot_token: "Kiritilmagan",
            register_date: today.toISOString().split('T')[0],
            status: "free",
            plan_expires: expireDate.toISOString().split('T')[0]
        }]
    };

    await fetch(`${SHEETDB_URL}?sheet=Users`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)
    });
}

// Bot tokenini saqlash
async function saveBotSettings() {
    let token = document.getElementById("bot-token").value;
    if(!token) return alert("Token kiriting!");

    await fetch(`${SHEETDB_URL}/user_id/${userId}?sheet=Users`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ bot_token: token })
    });
    alert("Bot token saqlandi!");
}

// Dizaynni saqlash va ImgBB ga rasm yuklash mantiqi
async function saveDesign() {
    let title = document.getElementById("app-title").value;
    let color = document.getElementById("app-color").value;
    let btnText = document.getElementById("btn-text").value;
    let fileInput = document.getElementById("app-image");
    let imageUrl = "";

    if(!title || !btnText) return alert("Barcha maydonlarni to'ldiring!");

    // Agar rasm tanlangan bo'lsa ImgBB ga yuklash (Sizning kalitingiz orqali xavfsiz fonda)
    if (fileInput.files.length > 0) {
        document.getElementById("upload-status").innerText = "Rasm yuklanmoqda...";
        let formData = new FormData();
        formData.append("image", fileInput.files[0]);

        let imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbApiKey}`, {
            method: "POST",
            body: formData
        });
        let imgData = await imgRes.json();
        imageUrl = imgData.data.url;
        document.getElementById("upload-status").innerText = "🎯 Rasm yuklandi!";
    }

    // Ma'lumotlarni jadvalning "Designs" degan yangi varog'iga saqlash
    let designData = {
        data: [{
            user_id: userId,
            title: title,
            color: color,
            image_url: imageUrl,
            button_text: btnText
        }]
    };

    // Eski dizayn bormi tekshirib, bor bo'lsa PUT, yo'q bo'lsa POST qilish uchun:
    let checkDesign = await fetch(`${SHEETDB_URL}?sheet=Designs`);
    let allDesigns = await checkDesign.json();
    let exist = allDesigns.some(d => d.user_id == userId);

    if(exist) {
        await fetch(`${SHEETDB_URL}/user_id/${userId}?sheet=Designs`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(designData.data[0])
        });
    } else {
        await fetch(`${SHEETDB_URL}?sheet=Designs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(designData)
        });
    }

    // Foydalanuvchiga taqdim etiladigan yakuniy Web App manzili:
    // Bu manzil uning o'z botiga joylanadi va ochilganda aynan uning dizayni chiqadi
    let finalUrl = `https://sizning-domeningiz.uz/client_app.html?user_id=${userId}`;
    document.getElementById("generated-url").value = finalUrl;
    document.getElementById("url-output").classList.remove("hidden");
    
    alert("Dizayn muvaffaqiyatli yaratildi!");
}

window.onload = initApp;
