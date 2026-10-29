const express = require('express');

const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Logger önce çalışır; JSON ayrıştırma hataları da loglanır.
app.use(logger);

// JSON body ayrıştırıcı
app.use(express.json());

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
