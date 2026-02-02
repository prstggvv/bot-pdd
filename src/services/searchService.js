const { loadSectionData } = require('../utils/loadData');
const { getSectionById } = require('../utils/sections');
const { MSG_NO_RESULTS, MSG_DATA_ERROR } = require('../types');

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

module.exports = {
  getItemByNumber,
  searchByName,
  normalizeNumber,
};
