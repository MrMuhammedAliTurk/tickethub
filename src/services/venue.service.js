const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');
const { success, failure, noContent } = require('./result');

function list(query = {}) {
  let venues = [...store.getAll('venues')];
  const { city, search } = query;
  if (city) venues = venues.filter((venue) => venue.city.toLowerCase() === city.toLowerCase());
  if (search) {
    const keyword = search.toLowerCase();
    venues = venues.filter((venue) => `${venue.name} ${venue.address}`.toLowerCase().includes(keyword));
  }
  const { page, limit, start, end } = paginate(query);
  const total = venues.length;
  return success({ total, page, limit, totalPages: Math.ceil(total / limit), data: venues.slice(start, end) });
}

function getById(id) {
  const venue = store.getById('venues', id);
  return venue ? success(venue) : failure(404, `Mekan bulunamadı: ${id}`);
}

function create(body) {
  const venue = { id: generateId('ven'), ...body };
  store.insert('venues', venue);
  return success(venue, 201);
}

function update(id, body) {
  const existing = store.getById('venues', id);
  if (!existing) return failure(404, `Mekan bulunamadı: ${id}`);
  const nextCapacity = body.capacity ?? existing.capacity;
  const dependentEvents = store.getAll('events').filter((event) => event.venueId === existing.id);
  const incompatibleEvent = dependentEvents.find((event) => event.capacity > nextCapacity);
  if (incompatibleEvent) return failure(409, `Mekan kapasitesi, "${incompatibleEvent.title}" etkinliğinin kapasitesinden düşük olamaz (${incompatibleEvent.capacity}).`);
  return success(store.update('venues', id, body));
}

function remove(id) {
  const existing = store.getById('venues', id);
  if (!existing) return failure(404, `Mekan bulunamadı: ${id}`);
  const hasEvents = store.getAll('events').some((event) => event.venueId === existing.id);
  if (hasEvents) return failure(409, 'Bu mekana bağlı etkinlikler bulunduğu için mekan silinemez. Önce etkinlikleri başka bir mekana taşıyın veya yönetin.');
  store.remove('venues', id);
  return noContent();
}

module.exports = { list, getById, create, update, remove };
