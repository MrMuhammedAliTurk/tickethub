/**
 * Sayfalama bilgilerini query parametrelerinden çıkarır.
 * Varsayılan: page=1, limit=10; tek istekte en fazla 100 kayıt.
 */
function paginate(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const requestedLimit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
  const limit = Math.min(requestedLimit, 100);
  const start = (page - 1) * limit;
  const end = start + limit;
  return { page, limit, start, end };
}

module.exports = { paginate };
