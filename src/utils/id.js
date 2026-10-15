const crypto = require('crypto');

/**
 * Benzersiz bir kayıt kimliği üretir.
 * Örnek: evt_3f9a2c1b
 */
function generateId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

module.exports = { generateId };
