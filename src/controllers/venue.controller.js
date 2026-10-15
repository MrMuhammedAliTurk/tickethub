const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');

function list(req, res) {
  let venues = [...store.getAll('venues')];
  const { city, search } = req.query;

  if (city) {
    venues = venues.filter((v) => v.city.toLowerCase() === city.toLowerCase());
  }
  if (search) {
    const keyword = search.toLowerCase();
    venues = venues.filter((v) =>
      `${v.name} ${v.address}`.toLowerCase().includes(keyword)
    );
  }

  const { page, limit, start, end } = paginate(req.query);
  const total = venues.length;

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: venues.slice(start, end)
  });
}

function getById(req, res) {
  const venue = store.getById('venues', req.params.id);
  if (!venue) {
    return res.status(404).json({ error: `Mekan bulunamadı: ${req.params.id}` });
  }
  res.json(venue);
}

function create(req, res) {
  const venue = {
    id: generateId('ven'),
    ...req.body
  };
  store.insert('venues', venue);
  res.status(201).json(venue);
}

function update(req, res) {
  const existing = store.getById('venues', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: `Mekan bulunamadı: ${req.params.id}` });
  }
  const updated = store.update('venues', req.params.id, req.body);
  res.json(updated);
}

function remove(req, res) {
  const removed = store.remove('venues', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `Mekan bulunamadı: ${req.params.id}` });
  }
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
