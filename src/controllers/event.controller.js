const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');

/**
 * Etkinlik listeleme — filtreleme, arama, sıralama ve sayfalama destekler.
 * Örnekler:
 *   GET /events?category=konser
 *   GET /events?city=istanbul
 *   GET /events?status=active
 *   GET /events?search=caz
 *   GET /events?sort=date:asc
 *   GET /events?page=1&limit=10
 */
function list(req, res) {
  let events = [...store.getAll('events')];
  const { category, city, status, search, sort } = req.query;

  if (category) {
    events = events.filter((e) => e.category === category);
  }
  if (city) {
    events = events.filter((e) => e.city.toLowerCase() === city.toLowerCase());
  }
  if (status) {
    events = events.filter((e) => e.status === status);
  }
  if (search) {
    const keyword = search.toLowerCase();
    events = events.filter((e) =>
      `${e.title} ${e.description}`.toLowerCase().includes(keyword)
    );
  }
  if (sort) {
    const [field, order] = sort.split(':');
    const direction = order === 'desc' ? -1 : 1;
    events.sort((a, b) => {
      if (a[field] < b[field]) return -1 * direction;
      if (a[field] > b[field]) return 1 * direction;
      return 0;
    });
  }

  const { page, limit, start, end } = paginate(req.query);
  const total = events.length;

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: events.slice(start, end)
  });
}

function getById(req, res) {
  const event = store.getById('events', req.params.id);
  if (!event) {
    return res.status(404).json({ error: `Etkinlik bulunamadı: ${req.params.id}` });
  }
  res.json(event);
}

function create(req, res) {
  const venue = store.getById('venues', req.body.venueId);
  if (!venue) {
    return res.status(400).json({ error: `Mekan bulunamadı: ${req.body.venueId}` });
  }

  const event = {
    id: generateId('evt'),
    ...req.body,
    status: req.body.status || 'active'
  };

  store.insert('events', event);
  res.status(201).json(event);
}

function update(req, res) {
  const existing = store.getById('events', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: `Etkinlik bulunamadı: ${req.params.id}` });
  }

  const updated = store.update('events', req.params.id, req.body);
  res.json(updated);
}

function remove(req, res) {
  const removed = store.remove('events', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `Etkinlik bulunamadı: ${req.params.id}` });
  }
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
