const { getSectionById, getCategoryLabel } = require('../utils/sections');
const { getItemByNumber, getCategories, getCategoryPage } = require('../services/searchService');
const { formatItem } = require('../services/formatService');
const {
  getSectionMenuKeyboard,
  getCategoriesInline,
  getCategoryPageInline,
} = require('../bot/keyboards');
const { clearState, setSectionContext } = require('./state');

function sendSectionMenu(bot, chatId, sectionId) {
  clearState(chatId);
  setSectionContext(chatId, sectionId);
  const section = getSectionById(sectionId);
  if (!section) return;
  const text = `Раздел: **${section.emoji} ${section.label}**\n\nВыберите способ поиска:`;
  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: getSectionMenuKeyboard(sectionId),
      resize_keyboard: true,
    },
  });
}

function handleCallback(query, bot) {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (data.startsWith('back_section_')) {
    const sectionId = data.replace('back_section_', '');
    bot.answerCallbackQuery(query.id);
    bot.deleteMessage(chatId, messageId).catch(() => { });
    sendSectionMenu(bot, chatId, sectionId);
    return;
  }

  if (data.startsWith('back_cat_')) {
    const sectionId = data.replace('back_cat_', '');
    const categories = getCategories(sectionId);
    bot.answerCallbackQuery(query.id);
    if (categories.length === 0) return;
    bot.editMessageText('Выберите категорию:', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: getCategoriesInline(sectionId, categories) },
    }).catch(() => { });
    return;
  }

  if (data.startsWith('cat_')) {
    const rest = data.replace('cat_', '');
    const parts = rest.split('_');

    if (parts.length < 3) return;
    const sectionId = parts[0];
    const categoryId = parts[1];
    const page = parseInt(parts[2], 10) || 0;
    const section = getSectionById(sectionId);

    if (!section) {
      bot.answerCallbackQuery(query.id, { text: 'Раздел не найден.' });
      return;
    }

    const { items, page: p, totalPages, total } = getCategoryPage(sectionId, categoryId, page);
    const label = getCategoryLabel(sectionId, categoryId);
    const text = `Категория «${label}» (${total} шт.). Страница ${p + 1}/${totalPages}. Выберите правило:`;

    bot.answerCallbackQuery(query.id);
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: getCategoryPageInline(sectionId, categoryId, items, p, totalPages) },
    }).catch(() => { });
    return;
  }

  if (data.startsWith('item_')) {
    const rest = data.replace('item_', '');
    const idx = rest.indexOf('_');
    const sectionId = idx >= 0 ? rest.slice(0, idx) : rest;
    const itemId = idx >= 0 ? rest.slice(idx + 1) : '';
    const section = getSectionById(sectionId);

    if (!section) {
      bot.answerCallbackQuery(query.id, { text: 'Раздел не найден.' });
      return;
    }

    const result = getItemByNumber(sectionId, itemId);
    bot.answerCallbackQuery(query.id);
    if (result.found) {
      const item = result.item;
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
    } else {
      bot.sendMessage(chatId, result.error || 'Не найдено.', {
        reply_markup: {
          keyboard: getSectionMenuKeyboard(sectionId),
          resize_keyboard: true,
        },
      });
    }
    return;
  }
}

module.exports = { handleCallback, sendSectionMenu };
