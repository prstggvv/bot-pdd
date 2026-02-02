const path = require('path');

const SECTIONS = [
  { id: 'signs', label: 'Знаки', emoji: '🚦', dataFile: 'signs' },
  { id: 'markings', label: 'Разметка', emoji: '🛣', dataFile: 'markings' },
];

function getSections() {
  return SECTIONS;
}

function getSectionById(sectionId) {
  return SECTIONS.find((s) => s.id === sectionId);
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
};
