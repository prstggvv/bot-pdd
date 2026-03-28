require('dotenv').config();
const { createBot } = require('./src/bot');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Ошибка: BOT_TOKEN не задан в .env');
  process.exit(1);
}

createBot(token);
console.log('Бот запущен.');
