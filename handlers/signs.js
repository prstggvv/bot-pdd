const signs = require('../utils/data/signs.json');
const { mainMenu, signsMenu } = require('../keyboards/mainKeyboard');
const { searchByTitle } = require('../services/search');
const { sendSign } = require('../services/formatter');

let mode = null;

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // ---------- /start ----------
  if (text === '/start') {
    mode = null;
    return bot.sendMessage(chatId, 'Выберите раздел:', { reply_markup: mainMenu });
  }

  // ---------- Раздел Знаки ----------
  if (text === '🚦 Знаки') {
    mode = null;
    return bot.sendMessage(chatId, 'Выберите способ поиска:', { reply_markup: signsMenu });
  }

  if (text === '🔢 По номеру') {
    mode = 'NUMBER';
    return bot.sendMessage(chatId, 'Введите номер знака (например 1.1)');
  }

  if (text === '🔍 По названию') {
    mode = 'NAME';
    return bot.sendMessage(chatId, 'Введите название знака или ключевое слово');
  }

  if (text === '⬅ Назад') {
    mode = null;
    return bot.sendMessage(chatId, 'Главное меню:', { reply_markup: mainMenu });
  }

  // ---------- Поиск ----------
  if (!text || !mode) return;

  if (mode === 'NUMBER') {
    const sign = signs[text];
    if (!sign) return bot.sendMessage(chatId, '❌ Знак не найден');
    sendSign(bot, chatId, text, sign);
    mode = null;
    return bot.sendMessage(chatId, 'Что дальше?', { reply_markup: signsMenu });
  }

  if (mode === 'NAME') {
    const results = searchByTitle(signs, text);
    if (!results.length) return bot.sendMessage(chatId, '❌ Знак не найден');
    results.forEach(([id, sign]) => sendSign(bot, chatId, id, sign));
    mode = null;
    return bot.sendMessage(chatId, 'Что дальше?', { reply_markup: signsMenu });
  }
};
