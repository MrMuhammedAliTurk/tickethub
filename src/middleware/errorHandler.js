/** Merkezi hata yönetimi middleware'i. */
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;
  const message = status >= 500 ? 'Beklenmeyen bir sunucu hatası oluştu.' : (err.message || 'İstek işlenemedi.');

  if (status >= 500) {
    console.error('[SUNUCU HATASI]', err.stack || err.message);
  } else {
    console.warn('[İSTEK HATASI]', status, err.message);
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
