const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');
const { success, failure, noContent } = require('./result');

function list(query = {}) {
  let tickets = [...store.getAll('tickets')];
  const { eventId, attendeeId, status } = query;
  if (eventId) tickets = tickets.filter((ticket) => ticket.eventId === eventId);
  if (attendeeId) tickets = tickets.filter((ticket) => ticket.attendeeId === attendeeId);
  if (status) tickets = tickets.filter((ticket) => ticket.status === status);
  const { page, limit, start, end } = paginate(query);
  const total = tickets.length;
  return success({ total, page, limit, totalPages: Math.ceil(total / limit), data: tickets.slice(start, end) });
}

function getById(id) {
  const ticket = store.getById('tickets', id);
  return ticket ? success(ticket) : failure(404, `Bilet bulunamadı: ${id}`);
}

function create(body) {
  const { eventId, attendeeId } = body;
  const event = store.getById('events', eventId);
  if (!event) return failure(400, `Etkinlik bulunamadı: ${eventId}`);
  if ((body.status || 'active') !== 'cancelled' && event.status !== 'active') return failure(409, 'Yalnızca aktif etkinlikler için bilet oluşturulabilir.');
  if (!store.getById('attendees', attendeeId)) return failure(400, `Katılımcı bulunamadı: ${attendeeId}`);

  const soldCount = store.getAll('tickets').filter((ticket) => ticket.eventId === eventId && ticket.status !== 'cancelled').length;
  if ((body.status || 'active') !== 'cancelled' && soldCount >= event.capacity) return failure(409, `Bu etkinliğin kapasitesi dolmuştur (${event.capacity}), bilet satışı yapılamaz.`);

  if (body.seat && (body.status || 'active') !== 'cancelled') {
    const seatTaken = store.getAll('tickets').some((ticket) => ticket.eventId === eventId && ticket.seat === body.seat && ticket.status !== 'cancelled');
    if (seatTaken) return failure(409, `Bu etkinlikte ${body.seat} koltuğu zaten dolu.`);
  }

  const ticket = { id: generateId('tkt'), eventId, attendeeId, seat: body.seat || `S${soldCount + 1}`, price: event.price, purchaseDate: new Date().toISOString(), status: body.status || 'active' };
  store.insert('tickets', ticket);
  return success(ticket, 201);
}

function update(id, body) {
  const existing = store.getById('tickets', id);
  if (!existing) return failure(404, `Bilet bulunamadı: ${id}`);
  const nextEventId = body.eventId ?? existing.eventId;
  const nextAttendeeId = body.attendeeId ?? existing.attendeeId;
  const nextStatus = body.status ?? existing.status;
  const event = store.getById('events', nextEventId);
  if (!event) return failure(400, `Etkinlik bulunamadı: ${nextEventId}`);
  if (!store.getById('attendees', nextAttendeeId)) return failure(400, `Katılımcı bulunamadı: ${nextAttendeeId}`);
  if (nextStatus === 'active' && event.status !== 'active') return failure(409, 'Yalnızca aktif etkinlikler için geçerli bilet tutulabilir.');

  const soldCount = store.getAll('tickets').filter((ticket) => ticket.id !== existing.id && ticket.eventId === nextEventId && ticket.status !== 'cancelled').length;
  if (nextStatus !== 'cancelled' && soldCount >= event.capacity) return failure(409, `Etkinliğin kapasitesi dolmuştur (${event.capacity}).`);

  const nextSeat = body.seat ?? existing.seat;
  if (nextStatus !== 'cancelled' && nextSeat) {
    const seatTaken = store.getAll('tickets').some((ticket) => ticket.id !== existing.id && ticket.eventId === nextEventId && ticket.seat === nextSeat && ticket.status !== 'cancelled');
    if (seatTaken) return failure(409, `Bu etkinlikte ${nextSeat} koltuğu zaten dolu.`);
  }

  const changes = { ...body };
  if (nextEventId !== existing.eventId) changes.price = event.price;
  return success(store.update('tickets', id, changes));
}

function remove(id) {
  const removed = store.remove('tickets', id);
  return removed ? noContent() : failure(404, `Bilet bulunamadı: ${id}`);
}

module.exports = { list, getById, create, update, remove };
