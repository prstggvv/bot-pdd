const { loadSectionData } = require('../utils/loadData');
const { getSectionById, getCategoryLabel } = require('../utils/sections');
const { MSG_NO_RESULTS, MSG_DATA_ERROR } = require('../types');

const ITEMS_PER_PAGE = 6;

function normalizeNumber(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
}

function toDocs(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const docs = [];
    for (const [code, raw] of Object.entries(data)) {
      docs.push({ code, ...raw });
    }
    return docs;
  }
  return [];
}

function getSectionDocs(sectionId) {
  const section = getSectionById(sectionId);
  if (!section) {
    return { docs: [], error: MSG_DATA_ERROR };
  }
  const raw = loadSectionData(section.dataFile);
  const docs = toDocs(raw);
  return { docs, error: null };
}

function getItemByNumber(sectionId, number) {
  const { docs, error } = getSectionDocs(sectionId);
  if (error) return { found: false, error };
  const normalized = normalizeNumber(number);
  const doc = docs.find((d) => normalizeNumber(d.code || '') === normalized);
  if (!doc) {
    return { found: false, error: MSG_NO_RESULTS };
  }
  return {
    found: true,
    item: {
      id: doc.code,
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || '',
      image: Array.isArray(doc.image) ? doc.image : [],
      gost: doc.gost,
      placement: doc.placement || '',
    },
  };
}

function searchByName(sectionId, query) {
  const { docs, error } = getSectionDocs(sectionId);
  if (error) {
    return { found: false, items: [], error };
  }
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return { found: false, items: [], error: 'Введите ключевое слово для поиска.' };
  }
  const items = [];
  for (const doc of docs) {
    const title = (doc.title || '').toLowerCase();
    const desc = (doc.description || '').toLowerCase();
    if (title.includes(q) || desc.includes(q)) {
      items.push({
        id: doc.code,
        title: doc.title || '',
        description: doc.description || '',
        category: doc.category || '',
        image: Array.isArray(doc.image) ? doc.image : [],
        gost: doc.gost,
        placement: doc.placement || '',
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
  const { docs, error } = getSectionDocs(sectionId);
  if (error) return [];
  const seen = new Set();
  const list = [];
  for (const doc of docs) {
    const id = doc.category || '';
    if (id && !seen.has(id)) {
      seen.add(id);
      list.push({ id, label: getCategoryLabel(sectionId, id) });
    }
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

function getItemsByCategory(sectionId, categoryId) {
  const { docs, error } = getSectionDocs(sectionId);
  if (error) return { items: [], total: 0 };
  const items = [];
  for (const doc of docs) {
    if ((doc.category || '') === categoryId) {
      items.push({
        id: doc.code,
        title: doc.title || '',
        description: doc.description || '',
        category: doc.category || '',
        image: Array.isArray(doc.image) ? doc.image : [],
        gost: doc.gost,
        placement: doc.placement || '',
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
  return { items: pageItems, page: p, totalPages, total };
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
