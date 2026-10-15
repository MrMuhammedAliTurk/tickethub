const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');

function list(req, res) {
  let tickets = [...store.getAll('tickets')];
  const { eventId, attendeeId, status } = req.query;

  if (eventId) {
    tickets = tickets.filter((t) => t.eventId === eventId);
  }
  if (attendeeId) {
    tickets = tickets.filter((t) => t.attendeeId === attendeeId);
  }
  if (status) {
    tickets = tickets.filter((t) => t.status === status);
  }

  const { page, limit, start, end } = paginate(req.query);
  const total = tickets.length;

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: tickets.slice(start, end)
  });
}

function getById(req, res) {
  const ticket = store.getById('tickets', req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: `Bilet bulunamadı: ${req.params.id}` });
  }
  res.json(ticket);
}

/**
 * Bilet oluşturma — kapasite kontrolü içerir.
 * Etkinliğin kapasitesi doluysa satış engellenir (409 Conflict).
 */
function create(req, res) {
  const { eventId, attendeeId } = req.body;

  const event = store.getById('events', eventId);
  if (!event) {
    return res.status(400).json({ error: `Etkinlik bulunamadı: ${eventId}` });
  }
  const attendee = store.getById('attendees', attendeeId);
  if (!attendee) {
    return res.status(400).json({ error: `Katılımcı bulunamadı: ${attendeeId}` });
  }

  const soldCount = store
    .getAll('tickets')
    .filter((t) => t.eventId === eventId && t.status !== 'cancelled').length;

  if (soldCount >= event.capacity) {
    return res.status(409).json({
      error: `Bu etkinliğin kapasitesi dolmuştur (${event.capacity}), bilet satışı yapılamaz.`
    });
  }

  const ticket = {
    id: generateId('tkt'),
    eventId,
    attendeeId,
    seat: req.body.seat || `S${soldCount + 1}`,
    price: event.price,
    purchaseDate: new Date().toISOString(),
    status: req.body.status || 'active'
  };

  store.insert('tickets', ticket);
  res.status(201).json(ticket);
}

function update(req, res) {
  const existing = store.getById('tickets', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: `Bilet bulunamadı: ${req.params.id}` });
  }
  const updated = store.update('tickets', req.params.id, req.body);
  res.json(updated);
}

function remove(req, res) {
  const removed = store.remove('tickets', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `Bilet bulunamadı: ${req.params.id}` });
  }
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
