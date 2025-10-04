require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const scrapeTikTok = require('./scraper');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// أمر /start لشرح طريقة الاستخدام
bot.onText(/\/start/, (msg) => {
  const welcome = `
👋 مرحبًا ${msg.from.first_name}!

📌 هذا البوت يعرض معلومات أي حساب TikTok.

✅ طريقة الاستخدام:
1. أرسل اسم المستخدم مباشرة مثل:
   \`jenna.kiwi\`

2. أو أرسل رابط الحساب مثل:
   \`https://www.tiktok.com/@jenna.kiwi\`

📊 البوت سيعرض لك:
- عدد المتابعين
- عدد الفيديوهات
- عدد الإعجابات
- اللغة والدولة
- هل الحساب خاص أو موثّق
- رابط الصورة الرمزية

💡 لا تحتاج لكتابة أي أمر، فقط أرسل الاسم أو الرابط مباشرة.

🚀 جاهز؟ أرسل أول حساب الآن!
  `.trim();

  bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
});

// استقبال أي رسالة تحتوي على اسم أو رابط TikTok
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // تجاهل الأوامر مثل /start أو /help
  if (!text || text.startsWith('/')) return;

  // استخراج اسم المستخدم من الرابط أو الإدخال المباشر
  const matchUsername = text.match(/tiktok\.com\/@([^/?]+)/);
  const username = matchUsername?.[1] || text;

  if (!username || username.length < 2) {
    bot.sendMessage(chatId, '❌ لم أتمكن من استخراج اسم المستخدم.');
    return;
  }

  bot.sendMessage(chatId, `🔍 جاري جلب بيانات المستخدم: @${username} ...`);

  const result = await scrapeTikTok(username);
  bot.sendMessage(chatId, result);
});