function buildCategoryKeyboard(categories) {
  return {
    keyboard: Object.entries(categories).map(
      ([key, label]) => [`${label} (${key})`]
    ).concat([['⬅ Назад']]),
    resize_keyboard: true
  };
}

module.exports = { buildCategoryKeyboard };
