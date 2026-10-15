const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api-requests.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Logger Middleware (ZORUNLU)
 * Her API isteğinin method, endpoint, zaman damgası, durum kodu
 * ve süresini hem konsola hem de log dosyasına kaydeder.
 */
function logger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`;

    console.log(line);

    ensureLogDir();
    fs.appendFile(LOG_FILE, line + '\n', (err) => {
      if (err) console.error('Log yazma hatası:', err.message);
    });
  });

  next();
}

module.exports = logger;
