/**
 * Merkezi hata yönetimi middleware'i.
 * Controller'larda next(err) ile fırlatılan hataları yakalar.
 */
function errorHandler(err, req, res, next) {
  console.error('[HATA]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası'
  });
}

module.exports = errorHandler;
