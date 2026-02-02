const userState = new Map();
const sectionContext = new Map();

function setState(chatId, sectionId, action) {
  userState.set(chatId, { sectionId, action });
}

function getState(chatId) {
  return userState.get(chatId);
}

function clearState(chatId) {
  userState.delete(chatId);
}

function setSectionContext(chatId, sectionId) {
  sectionContext.set(chatId, sectionId);
}

function getSectionContext(chatId) {
  return sectionContext.get(chatId);
}

function clearSectionContext(chatId) {
  sectionContext.delete(chatId);
}

module.exports = {
  setState,
  getState,
  clearState,
  setSectionContext,
  getSectionContext,
  clearSectionContext,
};
