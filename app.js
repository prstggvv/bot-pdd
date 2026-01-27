require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const signsHandler = require('./handlers/signs');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => signsHandler(bot, msg));
bot.on('message', (msg) => signsHandler(bot, msg));
