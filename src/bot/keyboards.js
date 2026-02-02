const { getSections, getSectionById } = require('../utils/sections');

function getMainMenuKeyboard() {
  const sections = getSections();
  const rows = sections.map((s) => [{ text: `${s.emoji} ${s.label}` }]);
  return rows;
}

function getSectionMenuKeyboard(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) return [];
  return [
    [{ text: '🔢 По номеру' }, { text: '🔍 По названию' }],
    [{ text: '📂 Категории' }],
    [{ text: '◀️ Назад в меню' }],
  ];
}

function getSectionBackInline(sectionId) {
  return [[{ text: '◀️ Назад', callback_data: `back_section_${sectionId}` }]];
}

function getSearchResultsInline(sectionId, items) {
  const maxButtons = 10;
  const slice = items.slice(0, maxButtons);
  const row = slice.map((it) => ({
    text: `${it.id} — ${it.title.length > 20 ? it.title.slice(0, 17) + '…' : it.title}`,
    callback_data: `item_${sectionId}_${it.id}`,
  }));
  const rows = [];
  for (let i = 0; i < row.length; i += 2) {
    rows.push(row.slice(i, i + 2));
  }
  rows.push([{ text: '◀️ Назад', callback_data: `back_section_${sectionId}` }]);
  return rows;
}

module.exports = {
  getMainMenuKeyboard,
  getSectionMenuKeyboard,
  getSectionBackInline,
  getSearchResultsInline,
};
