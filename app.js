require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const markingsData = require('./utils/data/markings.json');

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const data = JSON.parse(fs.readFileSync('./utils/data/markings.json'));


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(chatId, 'Выберите раздел:', {
    reply_markup: {
      keyboard: [
        ['🚦 Дорожные знаки'],
        ['🛣 Разметка']
      ],
      resize_keyboard: true
    }
  });
});
