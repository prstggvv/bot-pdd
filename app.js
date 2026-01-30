require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const router = require('./routes/router');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', (msg) => router(bot, msg));
