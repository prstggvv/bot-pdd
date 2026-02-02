const { getSectionById } = require('../utils/sections');
const { getItemByNumber } = require('../services/searchService');
const { formatItem } = require('../services/formatService');
const {
  getSectionMenuKeyboard,
  getSectionBackInline,
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
      bot.sendMessage(chatId, formatItem(result.item), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: getSectionBackInline(sectionId),
        },
      });
    } else {
      bot.sendMessage(chatId, result.error || 'Не найдено.', {
        reply_markup: { inline_keyboard: getSectionBackInline(sectionId) },
      });
    }
    return;
  }
}

module.exports = { handleCallback, sendSectionMenu };
