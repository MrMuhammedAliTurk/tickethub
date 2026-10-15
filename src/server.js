const app = require('./app');
const config = require('./config/config');

const { PORT, HOST } = config;

app.listen(PORT, () => {
  console.log(`TicketHub API ${HOST}:${PORT} adresinde çalışıyor.`);
});
