/**
 * Sayfalama bilgilerini query parametrelerinden çıkarır.
 * Varsayılan: page=1, limit=10
 */
function paginate(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
  const start = (page - 1) * limit;
  const end = start + limit;
  return { page, limit, start, end };
}

module.exports = { paginate };
