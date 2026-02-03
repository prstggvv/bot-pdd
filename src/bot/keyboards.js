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
    text: `${it.id} — ${it.title.length > 20 ? `${it.title.slice(0, 17)}…` : it.title}`,
    callback_data: `item_${sectionId}_${it.id}`,
  }));

  const rows = [];
  for (let i = 0; i < row.length; i += 2) {
    rows.push(row.slice(i, i + 2));
  }

  rows.push([{ text: '◀️ Назад', callback_data: `back_section_${sectionId}` }]);
  return rows;
}

function getCategoriesInline(sectionId, categories) {
  const rows = categories.map((c) => [
    { text: c.label, callback_data: `cat_${sectionId}_${c.id}_0` },
  ]);

  rows.push([{ text: '◀️ К выбору поиска', callback_data: `back_section_${sectionId}` }]);
  return rows;
}

function getCategoryPageInline(sectionId, categoryId, pageItems, page, totalPages) {
  const rows = [];
  const itemRow = pageItems.map((it) => ({
    text: `${it.id} — ${it.title.length > 18 ? `${it.title.slice(0, 15)}…` : it.title}`,
    callback_data: `item_${sectionId}_${it.id}`,
  }));

  for (let i = 0; i < itemRow.length; i += 2) {
    rows.push(itemRow.slice(i, i + 2));
  }

  const nav = [];
  if (page > 0) {
    nav.push({ text: '⬅', callback_data: `cat_${sectionId}_${categoryId}_${page - 1}` });
  }

  nav.push({ text: '📂 К категориям', callback_data: `back_cat_${sectionId}` });
  if (page < totalPages - 1) {
    nav.push({ text: '➡', callback_data: `cat_${sectionId}_${categoryId}_${page + 1}` });
  }

  rows.push(nav);
  return rows;
}

module.exports = {
  getMainMenuKeyboard,
  getSectionMenuKeyboard,
  getSectionBackInline,
  getSearchResultsInline,
  getCategoriesInline,
  getCategoryPageInline,
};
