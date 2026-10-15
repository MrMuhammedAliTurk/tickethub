/**
 * Bilinmeyen endpoint'ler için 404 döndürür.
 */
function notFound(req, res) {
  res.status(404).json({
    error: `Endpoint bulunamadı: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
