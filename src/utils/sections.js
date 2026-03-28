const path = require('path');

const SECTIONS = [
  {
    id: 'signs',
    label: 'Знаки',
    emoji: '🚦',
    dataFile: 'signs',
  },
  {
    id: 'markings',
    label: 'Разметка',
    emoji: '🛣',
    dataFile: 'markings',
  },
];

const CATEGORY_LABELS = {
  signs: {
    warning: 'Предупреждающие',
    priority: 'Приоритет',
    prohibitory: 'Запрещающие',
  },
  markings: {
    horizontal: 'Горизонтальная разметка',
  },
};

function getSections() {
  return SECTIONS;
}

function getSectionById(sectionId) {
  return SECTIONS.find((s) => s.id === sectionId);
}

function getCategoryLabel(sectionId, categoryId) {
  const bySection = CATEGORY_LABELS[sectionId];

  if (bySection && bySection[categoryId]) return bySection[categoryId];
  return categoryId;
}

function getDataDir() {
  return path.join(__dirname, 'data');
}

function getDataPath(dataFile) {
  return path.join(getDataDir(), `${dataFile}.json`);
}

module.exports = {
  getSections,
  getSectionById,
  getDataDir,
  getDataPath,
  getCategoryLabel,
};
