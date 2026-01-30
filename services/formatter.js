const fs = require('fs');

function sendItem(bot, chatId, id, item, icon) {
  bot.sendMessage(chatId, `
${icon} *${id} — ${item.title}*

📄 ${item.description}
🛠 ${item.usage}
📏 ${item.gost}
`, { parse_mode: 'Markdown' });

  item.images?.forEach(img =>
    bot.sendPhoto(chatId, fs.createReadStream(img))
  );
}

module.exports = { sendItem };
