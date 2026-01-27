const mainMenu = require('../keyboards/mainMenu');

module.exports = (bot, msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите раздел:', {
    reply_markup: mainMenu
  });
};
