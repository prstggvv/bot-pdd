function escapeMd(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/`/g, '\\`')
    .replace(/\[/g, '\\[');
}

function formatItem(item) {
  const title = escapeMd(item.title);
  const desc = escapeMd(item.description);
  const placement = escapeMd(item.placement || '');
  const lines = [`🚧 ${title}`, '', `📌 ${desc}`];
  if (placement) {
    lines.push('');
    lines.push(`📍 ${placement}`);
  }
  if (item.gost) {
    lines.push('');
    lines.push('ℹ ГОСТ/ПДД: ' + escapeMd(item.gost));
  }
  return lines.join('\n');
}

function formatSearchResults(items, sectionLabel) {
  const header = `Найдено в разделе «${sectionLabel}»: ${items.length}\n`;
  const list = items.map((it) => '• *' + escapeMd(it.id) + '* — ' + escapeMd(it.title)).join('\n');
  return header + '\n' + list;
}

module.exports = {
  formatItem,
  formatSearchResults,
  escapeMd,
};
