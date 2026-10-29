/**
 * Şema tabanlı istek gövdesi doğrulama middleware'i.
 * Bilinmeyen alanların sessizce kabul edilmesini ve sunucu tarafından
 * yönetilen alanların (ör. id, ticket price) istemciden değiştirilmesini önler.
 */
function validate(schema) {
  return (req, res, next) => {
    const body = req.body;
    const errors = [];

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        error: 'Doğrulama hatası',
        details: ['İstek gövdesi bir JSON nesnesi olmalıdır.']
      });
    }

    const allowedFields = new Set(Object.keys(schema));
    for (const field of Object.keys(body)) {
      if (!allowedFields.has(field)) {
        errors.push(`"${field}" alanına izin verilmiyor.`);
      }
    }

    if (Object.keys(body).length === 0) {
      errors.push('En az bir alan gönderilmelidir.');
    }

    for (const [field, rules] of Object.entries(schema)) {
      const present = Object.prototype.hasOwnProperty.call(body, field);
      const value = body[field];

      if (!present) {
        if (rules.required) errors.push(`"${field}" alanı zorunludur.`);
        continue;
      }
      if (value === undefined || value === null) {
        errors.push(`"${field}" alanı null veya undefined olamaz.`);
        continue;
      }
      if (value === '' && rules.required) {
        errors.push(`"${field}" alanı zorunludur.`);
        continue;
      }

      if (rules.type === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          errors.push(`"${field}" alanı geçerli bir sayı olmalıdır.`);
          continue;
        }
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`"${field}" alanı en az ${rules.min} olmalıdır.`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`"${field}" alanı en fazla ${rules.max} olmalıdır.`);
        }
      }

      if (rules.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`"${field}" alanı bir metin olmalıdır.`);
          continue;
        }
        if (rules.nonEmpty !== false && value.trim().length === 0) {
          errors.push(`"${field}" alanı boş bırakılamaz.`);
        }
        if (rules.minLength && value.trim().length < rules.minLength) {
          errors.push(`"${field}" alanı en az ${rules.minLength} karakter olmalıdır.`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`"${field}" alanı en fazla ${rules.maxLength} karakter olabilir.`);
        }
      }

      if (rules.type === 'email') {
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`"${field}" alanı geçerli bir e-posta adresi olmalıdır.`);
        }
      }

      if (rules.type === 'enum' && !rules.values.includes(value)) {
        errors.push(`"${field}" alanı şunlardan biri olmalıdır: ${rules.values.join(', ')}.`);
      }

      if (rules.type === 'date') {
        const isDateFormat = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
        const parsed = isDateFormat ? new Date(`${value}T00:00:00.000Z`) : null;
        const isRealDate = parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
        if (!isRealDate) {
          errors.push(`"${field}" alanı YYYY-AA-GG biçiminde geçerli bir tarih olmalıdır.`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Doğrulama hatası', details: errors });
    }

    next();
  };
}

module.exports = validate;
