const signs = require('../utils/data/signs.json');
const markings = require('../utils/data/markings.json');

const { mainMenu, entityMenu } = require('../keyboards/mainKeyboard');
const { searchByTitle } = require('../services/search');
const { sendItem } = require('../services/formatter');
const session = require('../state/session');
const categories = require('../utils/categories');
const { buildCategoryKeyboard } = require('../keyboards/categoryKeyboard');


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

    case '📂 Категории': {
      if (!session.entity) return;

      session.mode = 'CATEGORY';
      session.category = null;

      return bot.sendMessage(
        chatId,
        'Выберите категорию:',
        {
          reply_markup: buildCategoryKeyboard(categories[session.entity])
        }
      );
    }


    case '⬅ Назад':
      session.entity = null;
      session.mode = null;
      return bot.sendMessage(chatId, 'Главное меню:', {
        reply_markup: mainMenu
      });
  }

  if (!session.entity || !session.mode) return;

  // выбор категории
  if (session.mode === 'CATEGORY') {
    const categoryKey = text.match(/\((.+?)\)$/)?.[1];
    if (!categoryKey) return;

    const { data, icon } = ENTITIES[session.entity];

    const items = Object.entries(data).filter(
      ([, item]) => item.category === categoryKey
    );

    if (!items.length) {
      return bot.sendMessage(chatId, '❌ В этой категории ничего нет');
    }

    items.forEach(([id, item]) =>
      sendItem(bot, chatId, id, item, icon)
    );

    session.mode = null;
    session.category = null;

    return bot.sendMessage(chatId, 'Что дальше?', {
      reply_markup: entityMenu
    });
  }


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

    case 'CATEGORY': {
      session.mode = 'CATEGORY';
      return bot.sendMessage(chatId, 'Выберите категорию:', {
        reply_markup: buildCategoryKeyboard(categories[session.entity])
      });
    }
  }
};
