const fs = require('fs');

function sendSign(bot, chatId, id, sign) {
  bot.sendMessage(chatId, `
🚦 *${id} — ${sign.title}*

📄 ${sign.description}
🛠 ${sign.usage}
📏 ${sign.gost}
  `, { parse_mode: 'Markdown' });

  sign.images.forEach(img =>
    bot.sendPhoto(chatId, fs.createReadStream(img))
  );
}

module.exports = { sendSign };
