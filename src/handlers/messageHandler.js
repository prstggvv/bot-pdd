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
  const menuText = `Раздел: **${section.emoji} ${section.label}**\n\nВыберите способ поиска:`;
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
  const section = getSectionById(sectionId);

  if (!section) {
    clearState(chatId);
    return false;
  }

  if (action === 'by_number') {
    const result = getItemByNumber(sectionId, text);
    if (result.found) {
      bot.sendMessage(chatId, formatItem(result.item), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: getSectionMenuKeyboard(sectionId),
          resize_keyboard: true,
        },
      });
    } else {
      bot.sendMessage(chatId, result.error || 'Ничего не найдено. Введите другой номер.');
    }
    return true;
  }

  if (action === 'by_name') {
    const result = searchByName(sectionId, text);
    if (result.found) {
      const message = formatSearchResults(result.items, section.label);
      bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: getSearchResultsInline(sectionId, result.items),
        },
      });
    } else {
      bot.sendMessage(chatId, result.error || 'Ничего не найдено. Введите другой запрос.');
    }
    return true;
  }
  return false;
}

const SECTION_MENU_TEXTS = [
  '🔢 По номеру',
  '🔍 По названию',
  '📂 Категории',
  '◀️ Назад в меню',
];

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

  if (text === '🔢 По номеру') {
    clearState(chatId);
    setState(chatId, sectionId, 'by_number');
    bot.sendMessage(chatId, 'Введите номер (например: 1.1):');
    return true;
  }

  if (text === '🔍 По названию') {
    clearState(chatId);
    setState(chatId, sectionId, 'by_name');
    bot.sendMessage(chatId, 'Введите название или ключевое слово (например: переезд):');
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
