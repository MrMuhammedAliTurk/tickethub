const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');
const { success, failure, noContent } = require('./result');

function list(query = {}) {
  let attendees = [...store.getAll('attendees')];
  const { search } = query;
  if (search) {
    const keyword = search.toLowerCase();
    attendees = attendees.filter((attendee) => `${attendee.name} ${attendee.email}`.toLowerCase().includes(keyword));
  }
  const { page, limit, start, end } = paginate(query);
  const total = attendees.length;
  return success({ total, page, limit, totalPages: Math.ceil(total / limit), data: attendees.slice(start, end) });
}

function getById(id) {
  const attendee = store.getById('attendees', id);
  return attendee ? success(attendee) : failure(404, `Katılımcı bulunamadı: ${id}`);
}

function create(body) {
  const attendee = { id: generateId('att'), ...body };
  store.insert('attendees', attendee);
  return success(attendee, 201);
}

function update(id, body) {
  const existing = store.getById('attendees', id);
  if (!existing) return failure(404, `Katılımcı bulunamadı: ${id}`);
  return success(store.update('attendees', id, body));
}

function remove(id) {
  const existing = store.getById('attendees', id);
  if (!existing) return failure(404, `Katılımcı bulunamadı: ${id}`);
  const hasTickets = store.getAll('tickets').some((ticket) => ticket.attendeeId === existing.id);
  if (hasTickets) return failure(409, 'Bu katılımcıya ait biletler bulunduğu için katılımcı silinemez. Önce bilet kayıtlarını yönetin.');
  store.remove('attendees', id);
  return noContent();
}

module.exports = { list, getById, create, update, remove };
