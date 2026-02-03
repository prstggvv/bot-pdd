const { loadSectionData } = require('../utils/loadData');
const { getSectionById, getCategoryLabel } = require('../utils/sections');
const { MSG_NO_RESULTS, MSG_DATA_ERROR } = require('../types');

const ITEMS_PER_PAGE = 6;

function normalizeNumber(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
}

function getItemByNumber(sectionId, number) {
  const section = getSectionById(sectionId);
  if (!section) {
    return { found: false, error: MSG_DATA_ERROR };
  }
  const data = loadSectionData(section.dataFile);
  const normalized = normalizeNumber(number);
  const key = normalized;
  const raw = data[key];
  if (!raw) {
    return { found: false, error: MSG_NO_RESULTS };
  }
  return {
    found: true,
    item: {
      id: key,
      title: raw.title || '',
      description: raw.description || '',
      category: raw.category || '',
      image: Array.isArray(raw.image) ? raw.image : [],
      gost: raw.gost,
    },
  };
}

function searchByName(sectionId, query) {
  const section = getSectionById(sectionId);
  if (!section) {
    return { found: false, items: [], error: MSG_DATA_ERROR };
  }
  const data = loadSectionData(section.dataFile);
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return { found: false, items: [], error: 'Введите ключевое слово для поиска.' };
  }
  const items = [];
  for (const [id, raw] of Object.entries(data)) {
    const title = (raw.title || '').toLowerCase();
    const desc = (raw.description || '').toLowerCase();
    if (title.includes(q) || desc.includes(q)) {
      items.push({
        id,
        title: raw.title || '',
        description: raw.description || '',
        category: raw.category || '',
        image: Array.isArray(raw.image) ? raw.image : [],
        gost: raw.gost,
      });
    }
  }
  return {
    found: items.length > 0,
    items,
    error: items.length === 0 ? MSG_NO_RESULTS : undefined,
  };
}

function getCategories(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) return [];
  const data = loadSectionData(section.dataFile);
  const seen = new Set();
  const list = [];
  for (const raw of Object.values(data)) {
    const id = (raw && raw.category) || '';
    if (id && !seen.has(id)) {
      seen.add(id);
      list.push({ id, label: getCategoryLabel(sectionId, id) });
    }
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

function getItemsByCategory(sectionId, categoryId) {
  const section = getSectionById(sectionId);
  if (!section) return { items: [], total: 0 };
  const data = loadSectionData(section.dataFile);
  const items = [];
  for (const [id, raw] of Object.entries(data)) {
    if ((raw && raw.category) === categoryId) {
      items.push({
        id,
        title: raw.title || '',
        description: raw.description || '',
        category: raw.category || '',
        image: Array.isArray(raw.image) ? raw.image : [],
        gost: raw.gost,
      });
    }
  }
  items.sort((a, b) => a.id.localeCompare(b.id));
  const total = items.length;
  return { items, total };
}

function getCategoryPage(sectionId, categoryId, page) {
  const { items, total } = getItemsByCategory(sectionId, categoryId);
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const p = Math.max(0, Math.min(page, totalPages - 1));
  const start = p * ITEMS_PER_PAGE;
  const pageItems = items.slice(start, start + ITEMS_PER_PAGE);
  return {
    items: pageItems, page: p, totalPages, total,
  };
}

module.exports = {
  getItemByNumber,
  searchByName,
  normalizeNumber,
  getCategories,
  getItemsByCategory,
  getCategoryPage,
  ITEMS_PER_PAGE,
};
