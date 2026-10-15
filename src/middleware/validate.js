/**
 * Validation Middleware (İSTEĞE BAĞLI - ileri seviye)
 * Bir şema (rules) alarak request body'sini doğrular.
 * Geçersiz/eksik veri varsa 400 Bad Request döndürür.
 *
 * Desteklenen kurallar:
 *   required  : alan zorunlu mu
 *   type      : 'string' | 'number' | 'email' | 'enum'
 *   values    : enum için geçerli değerler listesi
 *   minLength : string için minimum uzunluk
 *   min       : number için minimum değer
 */
function validate(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const missing = value === undefined || value === null || value === '';

      if (rules.required && missing) {
        errors.push(`"${field}" alanı zorunludur.`);
        continue;
      }
      if (missing) continue;

      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`"${field}" alanı bir sayı olmalıdır.`);
      }
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`"${field}" alanı bir metin olmalıdır.`);
      }
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`"${field}" alanı geçerli bir e-posta adresi olmalıdır.`);
      }
      if (rules.type === 'enum' && !rules.values.includes(value)) {
        errors.push(`"${field}" alanı şunlardan biri olmalıdır: ${rules.values.join(', ')}.`);
      }
      if (typeof value === 'string' && rules.minLength && value.length < rules.minLength) {
        errors.push(`"${field}" alanı en az ${rules.minLength} karakter olmalıdır.`);
      }
      if (typeof value === 'number' && rules.min !== undefined && value < rules.min) {
        errors.push(`"${field}" alanı en az ${rules.min} olmalıdır.`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Doğrulama hatası',
        details: errors
      });
    }

    next();
  };
}

module.exports = validate;
