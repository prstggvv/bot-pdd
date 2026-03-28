const { getMainMenuKeyboard } = require('../bot/keyboards');

const WELCOME = 'Добро пожаловать! Выберите раздел:\n\n'
  + '🚦 **Знаки** — дорожные знаки\n'
  + '🛣 **Разметка** — дорожная разметка';

function handleStart(msg, bot) {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, WELCOME, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: getMainMenuKeyboard(),
      resize_keyboard: true,
    },
  });
}

module.exports = { handleStart };
