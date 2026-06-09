const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const SHEETDB_URL = "https://sheetdb.io/api/v1/53jj6rji62pdg";

// Bu funksiya barcha foydalanuvchilarning botlarini bitta serverda dinamik yurgizish uchun xizmat qiladi
async function startUserBots() {
    // Bazadagi hamma foydalanuvchilarni olish
    let response = await axios.get(`${SHEETDB_URL}?sheet=Users`);
    let users = response.data;

    users.forEach(async (user) => {
        if(user.bot_token && user.bot_token !== "Kiritilmagan") {
            const userBot = new Telegraf(user.bot_token);

            userBot.start(async (ctx) => {
                // Shu foydalanuvchining dizaynini jadvaldan qidirish
                let designRes = await axios.get(`${SHEETDB_URL}?sheet=Designs`);
                let userDesign = designRes.data.find(d => d.user_id == user.user_id);

                let title = userDesign ? userDesign.title : "Mening Web App Botim";
                let btnText = userDesign ? userDesign.button_text : "Ilovani ochish";
                let webAppUrl = `https://sizning-domeningiz.uz/client_app.html?user_id=${user.user_id}`;

                ctx.reply(`👋 ${title} botiga xush kelibsiz! Web ilovadan foydalanish uchun tugmani bosing:`, 
                    Markup.keyboard([
                        Markup.button.webApp(btnText, webAppUrl)
                    ]).resize()
                );
            });

            userBot.launch().catch(err => console.log(`Bot ishga tushmadi (Token xato yoki eskirgan): ${user.user_id}`));
        }
    });
}

startUserBots();
