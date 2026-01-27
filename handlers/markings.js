const markings = require('../utils/data/markings.json');
const { searchByTitle } = require('../services/search');
const { sendMarking } = require('../services/formatter');

let mode = null;

module.exports = (bot, payload) => {
  const chatId = payload.chat?.id || payload.message.chat.id;
  const text = payload.text?.trim();

  if (payload.data === 'MARKINGS_MENU') {
    mode = null;
    return bot.sendMessage(chatId, '🛣 Разметка:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔢 По номеру', callback_data: 'MARKINGS_BY_NUMBER' }],
          [{ text: '🔍 По названию', callback_data: 'MARKINGS_BY_NAME' }]
        ]
      }
    });
  }

  if (payload.data === 'MARKINGS_BY_NUMBER') {
    mode = 'NUMBER';
    return bot.sendMessage(chatId, 'Введите номер разметки');
  }

  if (payload.data === 'MARKINGS_BY_NAME') {
    mode = 'NAME';
    return bot.sendMessage(chatId, 'Введите название');
  }

  if (!text || !mode) return;

  if (mode === 'NUMBER' && markings[text]) {
    sendMarking(bot, chatId, text, markings[text]);
  }

  if (mode === 'NAME') {
    searchByTitle(markings, text).forEach(([id, item]) =>
      sendMarking(bot, chatId, id, item)
    );
  }

  mode = null;
};
