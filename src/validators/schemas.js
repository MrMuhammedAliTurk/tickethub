/**
 * Validation şemaları. Her alan için kurallar tanımlanır.
 * Bu şemalar route'larda validate(schema) middleware'i ile kullanılır.
 */

const CATEGORIES = ['konser', 'tiyatro', 'konferans', 'spor', 'festival', 'sinema'];
const EVENT_STATUSES = ['active', 'cancelled', 'completed'];
const TICKET_STATUSES = ['active', 'cancelled', 'used'];

const event = {
  title: { required: true, type: 'string', minLength: 3 },
  description: { required: true, type: 'string', minLength: 10 },
  category: { required: true, type: 'enum', values: CATEGORIES },
  city: { required: true, type: 'string' },
  venueId: { required: true, type: 'string' },
  date: { required: true, type: 'string' },
  price: { required: true, type: 'number', min: 0 },
  capacity: { required: true, type: 'number', min: 1 },
  status: { type: 'enum', values: EVENT_STATUSES }
};

const venue = {
  name: { required: true, type: 'string', minLength: 3 },
  city: { required: true, type: 'string' },
  address: { required: true, type: 'string' },
  capacity: { required: true, type: 'number', min: 1 }
};

const attendee = {
  name: { required: true, type: 'string', minLength: 2 },
  email: { required: true, type: 'email' },
  phone: { type: 'string' }
};

const ticket = {
  eventId: { required: true, type: 'string' },
  attendeeId: { required: true, type: 'string' },
  seat: { type: 'string' },
  status: { type: 'enum', values: TICKET_STATUSES }
};

/**
 * Bir şemadaki tüm alanların required kuralını kaldırır.
 * Güncelleme (PUT) işlemlerinde kısmi veri gönderilmesine izin verir;
 * gönderilen alanlar yine de type/enum/uzunluk kurallarına göre doğrulanır.
 */
function optional(schema) {
  const result = {};
  for (const [field, rules] of Object.entries(schema)) {
    result[field] = { ...rules, required: false };
  }
  return result;
}

module.exports = { event, venue, attendee, ticket, optional };
