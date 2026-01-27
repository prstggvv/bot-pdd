function searchByTitle(data, query) {
  query = query.toLowerCase();

  return Object.entries(data).filter(([_, item]) =>
    item.title.toLowerCase().includes(query)
  );
}

module.exports = { searchByTitle };
