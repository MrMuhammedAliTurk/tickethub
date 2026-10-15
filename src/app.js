const express = require('express');

const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// JSON body ayrıştırıcı
app.use(express.json());

// Logger middleware (tüm istekler için)
app.use(logger);

// Kök rota — API genel bakış
app.get('/', (req, res) => {
  res.json({
    name: 'TicketHub API',
    description: 'Etkinlik ve Biletleme Sistemi REST API',
    version: '1.0.0',
    resources: ['/events', '/venues', '/attendees', '/tickets', '/reports']
  });
});

// Rotalar
app.use('/', routes);

// 404 ve hata yönetimi
app.use(notFound);
app.use(errorHandler);

module.exports = app;
