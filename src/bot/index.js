const TelegramBot = require('node-telegram-bot-api');
const { handleStart } = require('../commands/start');
const { handleMessage } = require('../handlers/messageHandler');
const { handleCallback } = require('../handlers/callbackHandler');

function createBot(token) {
  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    try {
      handleStart(msg, bot);
    } catch (err) {
      console.error('handleStart:', err);
      bot.sendMessage(msg.chat.id, 'Произошла ошибка. Попробуйте /start').catch(() => { });
    }
  });

  bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    try {
      handleMessage(msg, bot);
    } catch (err) {
      console.error('handleMessage:', err);
      bot.sendMessage(msg.chat.id, 'Произошла ошибка. Попробуйте ещё раз или /start').catch(() => { });
    }
  });

  bot.on('callback_query', (query) => {
    try {
      handleCallback(query, bot);
    } catch (err) {
      console.error('handleCallback:', err);
      bot.answerCallbackQuery(query.id, { text: 'Ошибка' }).catch(() => { });
      bot.sendMessage(query.message.chat.id, 'Произошла ошибка. Попробуйте ещё раз.').catch(() => { });
    }
  });

  bot.on('polling_error', (err) => {
    console.error('polling_error:', err.message || err);
  });

  return bot;
}

module.exports = { createBot };
