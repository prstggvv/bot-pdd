const { getSections, getSectionById } = require('../utils/sections');
const { getItemByNumber, searchByName, getCategories } = require('../services/searchService');
const { formatItem, formatSearchResults } = require('../services/formatService');
const { getSectionMenuKeyboard, getSearchResultsInline, getCategoriesInline } = require('../bot/keyboards');
const {
  setState,
  getState,
  clearState,
  getSectionContext,
  clearSectionContext,
  setSectionContext,
} = require('./state');

function handleMainMenuButton(bot, chatId, text) {
  const sections = getSections();
  const section = sections.find((s) => `${s.emoji} ${s.label}` === text);

  if (!section) return false;
  clearState(chatId);
  setSectionContext(chatId, section.id);
  const menuText = `Раздел: **${section.emoji} ${section.label}**\n\nПоиск по номеру или названию, либо категории:`;
  bot.sendMessage(chatId, menuText, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: getSectionMenuKeyboard(section.id),
      resize_keyboard: true,
    },
  });
  return true;
}

function handleUserInput(bot, chatId, text) {
  const state = getState(chatId);
  if (!state) return false;
  const { sectionId, action } = state;
  if (action !== 'search') return false;
  const section = getSectionById(sectionId);
  if (!section) {
    clearState(chatId);
    return false;
  }

  const byNumber = getItemByNumber(sectionId, text);
  if (byNumber.found) {
    const item = byNumber.item;
    bot.sendMessage(chatId, formatItem(item), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: getSectionMenuKeyboard(sectionId),
        resize_keyboard: true,
      },
    }).then(() => {
      if (Array.isArray(item.image)) {
        for (const img of item.image) {
          bot.sendPhoto(chatId, img).catch(() => { });
        }
      }
    }).catch(() => { });
    return true;
  }

  const byName = searchByName(sectionId, text);
  if (byName.found) {
    const message = formatSearchResults(byName.items, section.label);
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: getSearchResultsInline(sectionId, byName.items),
      },
    });
    return true;
  }

  bot.sendMessage(chatId, byName.error || 'Ничего не найдено. Введите номер или ключевое слово.');
  return true;
}

const SECTION_MENU_TEXTS = ['🔍 Поиск', '📂 Категории', '◀️ Назад в меню'];

function handleSectionMenuPress(bot, chatId, text, sectionId) {
  if (!sectionId) return false;

  if (text === '◀️ Назад в меню') {
    clearState(chatId);
    clearSectionContext(chatId);
    bot.sendMessage(chatId, 'Главное меню:', {
      reply_markup: {
        keyboard: require('../bot/keyboards').getMainMenuKeyboard(),
        resize_keyboard: true,
      },
    });
    return true;
  }

  if (text === '🔍 Поиск') {
    clearState(chatId);
    setState(chatId, sectionId, 'search');
    bot.sendMessage(chatId, 'Введите номер (например 1.1) или ключевое слово для поиска:');
    return true;
  }

  if (text === '📂 Категории') {
    clearState(chatId);
    setSectionContext(chatId, sectionId);
    const categories = getCategories(sectionId);
    if (categories.length === 0) {
      bot.sendMessage(chatId, 'В этом разделе нет категорий.', {
        reply_markup: {
          keyboard: getSectionMenuKeyboard(sectionId),
          resize_keyboard: true,
        },
      });
      return true;
    }

    bot.sendMessage(chatId, 'Выберите категорию:', {
      reply_markup: {
        inline_keyboard: getCategoriesInline(sectionId, categories),
      },
    });
    return true;
  }
  return false;
}

function handleMessage(msg, bot) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  if (!text) return;

  const currentSectionId = getSectionContext(chatId) || getState(chatId)?.sectionId;
  if (currentSectionId && SECTION_MENU_TEXTS.includes(text)) {
    if (handleSectionMenuPress(bot, chatId, text, currentSectionId)) return;
  }

  if (handleMainMenuButton(bot, chatId, text)) return;
  if (handleUserInput(bot, chatId, text)) return;

  const sectionId = getSectionContext(chatId);
  const sectionMenuRows = sectionId
    ? getSectionMenuKeyboard(sectionId).flatMap((r) => r.map((b) => b.text))
    : [];
  if (sectionMenuRows.includes(text) && handleSectionMenuPress(bot, chatId, text, sectionId)) return;
}

module.exports = { handleMessage };
