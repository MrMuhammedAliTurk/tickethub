const store = require('../data/store');
const { generateId } = require('../utils/id');
const { paginate } = require('../utils/pagination');
const { success, failure, noContent } = require('./result');

function list(query = {}) {
  let events = [...store.getAll('events')];
  const { category, city, status, search, sort } = query;

  if (category) events = events.filter((event) => event.category === category);
  if (city) events = events.filter((event) => event.city.toLowerCase() === city.toLowerCase());
  if (status) events = events.filter((event) => event.status === status);
  if (search) {
    const keyword = search.toLowerCase();
    events = events.filter((event) => `${event.title} ${event.description}`.toLowerCase().includes(keyword));
  }

  if (sort) {
    const parts = sort.split(':');
    const [field, order = 'asc'] = parts;
    const allowedSortFields = ['title', 'date', 'price', 'capacity', 'category', 'city', 'status'];
    if (parts.length > 2 || !allowedSortFields.includes(field) || !['asc', 'desc'].includes(order)) {
      return failure(400, 'Geçersiz sıralama parametresi. Alan: title, date, price, capacity, category, city, status; yön: asc veya desc olmalıdır.');
    }
    const direction = order === 'desc' ? -1 : 1;
    events.sort((a, b) => {
      if (a[field] < b[field]) return -1 * direction;
      if (a[field] > b[field]) return 1 * direction;
      return 0;
    });
  }

  const { page, limit, start, end } = paginate(query);
  const total = events.length;
  return success({ total, page, limit, totalPages: Math.ceil(total / limit), data: events.slice(start, end) });
}

function getById(id) {
  const event = store.getById('events', id);
  return event ? success(event) : failure(404, `Etkinlik bulunamadı: ${id}`);
}

function create(body) {
  const venue = store.getById('venues', body.venueId);
  if (!venue) return failure(400, `Mekan bulunamadı: ${body.venueId}`);
  if (body.capacity > venue.capacity) return failure(400, `Etkinlik kapasitesi mekan kapasitesini (${venue.capacity}) aşamaz.`);

  const event = { id: generateId('evt'), ...body, status: body.status || 'active' };
  store.insert('events', event);
  return success(event, 201);
}

function update(id, body) {
  const existing = store.getById('events', id);
  if (!existing) return failure(404, `Etkinlik bulunamadı: ${id}`);

  const nextVenueId = body.venueId ?? existing.venueId;
  const venue = store.getById('venues', nextVenueId);
  if (!venue) return failure(400, `Mekan bulunamadı: ${nextVenueId}`);

  const nextCapacity = body.capacity ?? existing.capacity;
  if (nextCapacity > venue.capacity) return failure(400, `Etkinlik kapasitesi mekan kapasitesini (${venue.capacity}) aşamaz.`);

  const soldCount = store.getAll('tickets').filter((ticket) => ticket.eventId === existing.id && ticket.status !== 'cancelled').length;
  if (nextCapacity < soldCount) return failure(409, `Kapasite ${soldCount} aktif/satılmış biletin altına düşürülemez.`);

  return success(store.update('events', id, body));
}

function remove(id) {
  const existing = store.getById('events', id);
  if (!existing) return failure(404, `Etkinlik bulunamadı: ${id}`);
  const hasTickets = store.getAll('tickets').some((ticket) => ticket.eventId === existing.id);
  if (hasTickets) return failure(409, 'Bu etkinliğe bağlı biletler bulunduğu için etkinlik silinemez. Önce bilet kayıtlarını yönetin.');
  store.remove('events', id);
  return noContent();
}

module.exports = { list, getById, create, update, remove };
