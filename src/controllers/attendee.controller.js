const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');

function list(req, res) {
  let attendees = [...store.getAll('attendees')];
  const { search } = req.query;

  if (search) {
    const keyword = search.toLowerCase();
    attendees = attendees.filter((a) =>
      `${a.name} ${a.email}`.toLowerCase().includes(keyword)
    );
  }

  const { page, limit, start, end } = paginate(req.query);
  const total = attendees.length;

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: attendees.slice(start, end)
  });
}

function getById(req, res) {
  const attendee = store.getById('attendees', req.params.id);
  if (!attendee) {
    return res.status(404).json({ error: `Katılımcı bulunamadı: ${req.params.id}` });
  }
  res.json(attendee);
}

function create(req, res) {
  const attendee = {
    id: generateId('att'),
    ...req.body
  };
  store.insert('attendees', attendee);
  res.status(201).json(attendee);
}

function update(req, res) {
  const existing = store.getById('attendees', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: `Katılımcı bulunamadı: ${req.params.id}` });
  }
  const updated = store.update('attendees', req.params.id, req.body);
  res.json(updated);
}

function remove(req, res) {
  const removed = store.remove('attendees', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `Katılımcı bulunamadı: ${req.params.id}` });
  }
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
