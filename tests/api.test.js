const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tickethub-test-'));
const testDbPath = path.join(tempDir, 'db.json');
const testLogPath = path.join(tempDir, 'api-requests.log');
fs.copyFileSync(path.join(__dirname, '..', 'src', 'data', 'db.json'), testDbPath);

// Isolate test data and logs so tests never modify the project's seed database.
process.env.TICKETHUB_DB_PATH = testDbPath;
process.env.TICKETHUB_LOG_FILE = testLogPath;

const app = require('../src/app');
const server = app.listen(0);
let baseUrl;

test.before(async () => {
  await new Promise((resolve, reject) => {
    if (server.listening) return resolve();
    server.once('error', reject);
    server.once('listening', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  return { status: response.status, body };
}

function json(method, body) {
  return { method, body: JSON.stringify(body) };
}

test('API kök rotası servis bilgisini döndürür', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'TicketHub API');
  assert.ok(response.body.resources.includes('/tickets'));
});

test('listeleme filtreleme ve sayfalama meta verilerini döndürür', async () => {
  const response = await request('/events?category=konser&page=1&limit=2');
  assert.equal(response.status, 200);
  assert.equal(response.body.page, 1);
  assert.equal(response.body.limit, 2);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.every((event) => event.category === 'konser'));
});

test('geçersiz tarih ve izin verilmeyen alanlarla etkinlik oluşturulamaz', async () => {
  const invalidDate = await request('/events', json('POST', {
    title: 'Test Etkinliği',
    description: 'Yeterince uzun açıklama metni',
    category: 'konser',
    city: 'Ankara',
    venueId: 'ven_003',
    date: '2026-02-31',
    price: 100,
    capacity: 100
  }));
  assert.equal(invalidDate.status, 400);
  assert.match(invalidDate.body.error, /Doğrulama/);

  const unknownField = await request('/events', json('POST', {
    title: 'Test Etkinliği',
    description: 'Yeterince uzun açıklama metni',
    category: 'konser',
    city: 'Ankara',
    venueId: 'ven_003',
    date: '2026-12-31',
    price: 100,
    capacity: 100,
    id: 'client-controlled-id'
  }));
  assert.equal(unknownField.status, 400);
  assert.ok(unknownField.body.details.some((detail) => detail.includes('id')));
});

test('etkinlik oluşturma ve güncelleme geçerli verilerle çalışır', async () => {
  const created = await request('/events', json('POST', {
    title: 'Ankara Backend Günü',
    description: 'Node.js ve Express üzerine bir teknik etkinlik.',
    category: 'konferans',
    city: 'Ankara',
    venueId: 'ven_003',
    date: '2026-12-20',
    price: 250,
    capacity: 500
  }));
  assert.equal(created.status, 201);
  assert.ok(created.body.id);

  const details = await request(`/events/${created.body.id}`);
  assert.equal(details.status, 200);
  assert.equal(details.body.title, 'Ankara Backend Günü');

  const updated = await request(`/events/${created.body.id}`, json('PUT', { price: 275 }));
  assert.equal(updated.status, 200);
  assert.equal(updated.body.price, 275);

  const deleted = await request(`/events/${created.body.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);
  assert.equal((await request(`/events/${created.body.id}`)).status, 404);
});

test('etkinlik kapasitesi mekan kapasitesini aşamaz ve bulunmayan mekan atanamaz', async () => {
  const tooLarge = await request('/events', json('POST', {
    title: 'Kapasite Kontrolü',
    description: 'Mekan kapasitesi kontrolünü sınayan etkinlik.',
    category: 'konser',
    city: 'Ankara',
    venueId: 'ven_003',
    date: '2026-12-20',
    price: 100,
    capacity: 5000
  }));
  assert.equal(tooLarge.status, 400);

  const invalidVenue = await request('/events/evt_003', json('PUT', { venueId: 'ven_missing' }));
  assert.equal(invalidVenue.status, 400);
});

test('bilet fiyatı istemci tarafından değiştirilemez ve ilişki kontrolleri çalışır', async () => {
  const priceOverride = await request('/tickets/tkt_001', json('PUT', { price: 1 }));
  assert.equal(priceOverride.status, 400);

  const missingAttendee = await request('/tickets/tkt_001', json('PUT', { attendeeId: 'att_missing' }));
  assert.equal(missingAttendee.status, 400);
});

test('aynı etkinlikte dolu koltuk için ikinci bilet oluşturulamaz', async () => {
  const response = await request('/tickets', json('POST', {
    eventId: 'evt_001',
    attendeeId: 'att_003',
    seat: 'A1'
  }));
  assert.equal(response.status, 409);
});

test('bağımlı kayıtlar varken etkinlik, mekan veya katılımcı silinemez', async () => {
  assert.equal((await request('/events/evt_001', { method: 'DELETE' })).status, 409);
  assert.equal((await request('/venues/ven_001', { method: 'DELETE' })).status, 409);
  assert.equal((await request('/attendees/att_001', { method: 'DELETE' })).status, 409);
});


test('mekan CRUD işlemleri çalışır', async () => {
  const created = await request('/venues', json('POST', {
    name: 'Test Sahnesi', city: 'Ankara', address: 'Çankaya', capacity: 150
  }));
  assert.equal(created.status, 201);

  const details = await request(`/venues/${created.body.id}`);
  assert.equal(details.status, 200);
  assert.equal(details.body.name, 'Test Sahnesi');

  const updated = await request(`/venues/${created.body.id}`, json('PUT', { address: 'Kızılay' }));
  assert.equal(updated.status, 200);
  assert.equal(updated.body.address, 'Kızılay');

  assert.equal((await request(`/venues/${created.body.id}`, { method: 'DELETE' })).status, 204);
});

test('katılımcı CRUD işlemleri çalışır', async () => {
  const created = await request('/attendees', json('POST', {
    name: 'Test Katılımcı', email: 'test.katilimci@example.com', phone: '05000000000'
  }));
  assert.equal(created.status, 201);

  const details = await request(`/attendees/${created.body.id}`);
  assert.equal(details.status, 200);

  const updated = await request(`/attendees/${created.body.id}`, json('PUT', { phone: '05001112233' }));
  assert.equal(updated.status, 200);
  assert.equal(updated.body.phone, '05001112233');

  assert.equal((await request(`/attendees/${created.body.id}`, { method: 'DELETE' })).status, 204);
});

test('bilet CRUD işlemleri çalışır', async () => {
  const created = await request('/tickets', json('POST', {
    eventId: 'evt_003', attendeeId: 'att_003', seat: 'TEST-SEAT-901'
  }));
  assert.equal(created.status, 201);
  assert.equal(created.body.price, 200);

  const details = await request(`/tickets/${created.body.id}`);
  assert.equal(details.status, 200);

  const updated = await request(`/tickets/${created.body.id}`, json('PUT', { status: 'used' }));
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'used');

  assert.equal((await request(`/tickets/${created.body.id}`, { method: 'DELETE' })).status, 204);
});

test('sıralama parametreleri güvenli alanlar ve yönlerle sınırlandırılmıştır', async () => {
  const invalidField = await request('/events?sort=unknownField:desc');
  assert.equal(invalidField.status, 400);

  const invalidOrder = await request('/events?sort=price:sideways');
  assert.equal(invalidOrder.status, 400);
});

test('bozuk JSON gövdesi 400 döndürür ve hata akışı kontrollüdür', async () => {
  const response = await request('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json'
  });
  assert.equal(response.status, 400);
  assert.ok(response.body.error);
});

test('raporlama özeti mevcut verilerden hesaplanır', async () => {
  const response = await request('/reports/summary');
  assert.equal(response.status, 200);
  assert.ok(response.body.totalEvents >= 5);
  assert.equal(response.body.totalVenues, 4);
  assert.ok(response.body.totalTicketsSold >= 3);
});

test('tanımlanmamış endpoint 404 döndürür', async () => {
  const response = await request('/not-a-route');
  assert.equal(response.status, 404);
  assert.match(response.body.error, /Endpoint bulunamadı/);
});
