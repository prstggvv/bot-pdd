const fs = require('fs');
const { getDataPath } = require('./sections');

const cache = new Map();

function loadSectionData(dataFile) {
  if (cache.has(dataFile)) {
    return cache.get(dataFile);
  }

  const filePath = getDataPath(dataFile);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  cache.set(dataFile, data);
  return data;
}

function clearCache() {
  cache.clear();
}

module.exports = {
  loadSectionData,
  clearCache,
};
