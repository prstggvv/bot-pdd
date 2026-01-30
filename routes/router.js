const signs = require('../utils/data/signs.json');
const markings = require('../utils/data/markings.json');

const { mainMenu, entityMenu } = require('../keyboards/mainKeyboard');
const { searchByTitle } = require('../services/search');
const { sendItem } = require('../services/formatter');
const session = require('../state/session');

const ENTITIES = {
  signs: {
    label: '🚦 Знаки',
    icon: '🚦',
    data: signs
  },
  markings: {
    label: '🛣 Разметка',
    icon: '🛣',
    data: markings
  }
};

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  switch (text) {
    case '/start':
      session.entity = null;
      session.mode = null;
      return bot.sendMessage(chatId, 'Выберите раздел:', {
        reply_markup: mainMenu
      });

    case ENTITIES.signs.label:
      session.entity = 'signs';
      session.mode = null;
      return bot.sendMessage(chatId, '🚦 Знаки — выберите способ поиска:', {
        reply_markup: entityMenu
      });

    case ENTITIES.markings.label:
      session.entity = 'markings';
      session.mode = null;
      return bot.sendMessage(chatId, '🛣 Разметка — выберите способ поиска:', {
        reply_markup: entityMenu
      });

    case '🔢 По номеру':
      session.mode = 'NUMBER';
      return bot.sendMessage(chatId, 'Введите номер (например 1.1)');

    case '🔍 По названию':
      session.mode = 'NAME';
      return bot.sendMessage(chatId, 'Введите название или ключевое слово');

    case '📂 Категории':
      return bot.sendMessage(chatId, '📂 Категории будут добавлены позже');

    case '⬅ Назад':
      session.entity = null;
      session.mode = null;
      return bot.sendMessage(chatId, 'Главное меню:', {
        reply_markup: mainMenu
      });
  }

  if (!session.entity || !session.mode) return;

  const { data, icon } = ENTITIES[session.entity];

  switch (session.mode) {
    case 'NUMBER': {
      const item = data[text];
      if (!item) {
        return bot.sendMessage(chatId, '❌ Не найдено');
      }

      sendItem(bot, chatId, text, item, icon);
      session.mode = null;

      return bot.sendMessage(chatId, 'Что дальше?', {
        reply_markup: entityMenu
      });
    }

    case 'NAME': {
      const results = searchByTitle(data, text);

      if (!results.length) {
        return bot.sendMessage(chatId, '❌ Не найдено');
      }

      results.forEach(([id, item]) => {
        sendItem(bot, chatId, id, item, icon);
      });

      session.mode = null;

      return bot.sendMessage(chatId, 'Что дальше?', {
        reply_markup: entityMenu
      });
    }
  }
};
