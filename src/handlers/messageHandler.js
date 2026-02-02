const { getSections, getSectionById } = require('../utils/sections');
const { getItemByNumber, searchByName } = require('../services/searchService');
const { formatItem, formatSearchResults } = require('../services/formatService');
const { getSectionMenuKeyboard, getSearchResultsInline } = require('../bot/keyboards');
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

function handleSectionMenuButton(bot, chatId, text) {
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
    const state = getState(chatId);
    const sectionId = state?.sectionId;
    if (!sectionId) return false;
    setState(chatId, sectionId, 'by_number');
    bot.sendMessage(chatId, 'Введите номер (например: 1.1):');
    return true;
  }
  if (text === '🔍 По названию') {
    const state = getState(chatId);
    const sectionId = state?.sectionId;
    if (!sectionId) return false;
    setState(chatId, sectionId, 'by_name');
    bot.sendMessage(chatId, 'Введите название или ключевое слово (например: переезд):');
    return true;
  }
  if (text === '📂 Категории') {
    bot.sendMessage(
      chatId,
      'Категории будут доступны в следующем обновлении. Пока используйте поиск по номеру или по названию.',
      {
        reply_markup: {
          keyboard: getSectionMenuKeyboard(getState(chatId)?.sectionId || ''),
          resize_keyboard: true,
        },
      }
    );
    return true;
  }
  return false;
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
          inline_keyboard: require('../bot/keyboards').getSectionBackInline(sectionId),
        },
      });
    } else {
      bot.sendMessage(
        chatId,
        `${result.error || 'Ничего не найдено.'}\n\nВведите другой номер или нажмите «◀️ Назад в меню».`
      );
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
      bot.sendMessage(
        chatId,
        `${result.error || 'Ничего не найдено.'}\n\nВведите другой запрос или нажмите «◀️ Назад в меню».`
      );
    }
    return true;
  }
  return false;
}

function handleMessage(msg, bot) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  if (!text) return;

  if (handleUserInput(bot, chatId, text)) return;
  if (handleMainMenuButton(bot, chatId, text)) return;

  const currentSectionId = getSectionContext(chatId);
  const sectionMenuRows = currentSectionId
    ? getSectionMenuKeyboard(currentSectionId).flatMap((r) => r.map((b) => b.text))
    : [];
  const isSectionButton = sectionMenuRows.includes(text);

  if (isSectionButton) {
    if (text === '🔢 По номеру') {
      setState(chatId, currentSectionId, 'by_number');
      bot.sendMessage(chatId, 'Введите номер (например: 1.1):');
      return;
    }
    if (text === '🔍 По названию') {
      setState(chatId, currentSectionId, 'by_name');
      bot.sendMessage(chatId, 'Введите название или ключевое слово (например: переезд):');
      return;
    }
    if (text === '📂 Категории') {
      bot.sendMessage(
        chatId,
        'Категории будут доступны в следующем обновлении. Используйте поиск по номеру или по названию.',
        {
          reply_markup: {
            keyboard: getSectionMenuKeyboard(currentSectionId),
            resize_keyboard: true,
          },
        }
      );
      return true;
    }
    if (text === '◀️ Назад в меню') {
      clearState(chatId);
      clearSectionContext(chatId);
      bot.sendMessage(chatId, 'Главное меню:', {
        reply_markup: {
          keyboard: require('../bot/keyboards').getMainMenuKeyboard(),
          resize_keyboard: true,
        },
      });
      return;
    }
  }

  if (handleSectionMenuButton(bot, chatId, text)) return;
}

module.exports = { handleMessage };
