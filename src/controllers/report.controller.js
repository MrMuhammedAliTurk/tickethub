const store = require('../data/store');

/**
 * Raporlama Servisleri (İSTEĞE BAĞLI - ileri seviye)
 * Satış, doluluk, katılımcı listesi ve genel özet bilgilerini döndürür.
 */

// Belirli bir etkinliğin satış raporu
function eventSales(req, res) {
  const { id } = req.params;
  const event = store.getById('events', id);
  if (!event) {
    return res.status(404).json({ error: `Etkinlik bulunamadı: ${id}` });
  }

  const sold = store
    .getAll('tickets')
    .filter((t) => t.eventId === id && t.status !== 'cancelled');

  const revenue = sold.reduce((sum, t) => sum + t.price, 0);
  const occupancy = ((sold.length / event.capacity) * 100).toFixed(1) + '%';

  res.json({
    event: { id: event.id, title: event.title },
    sold: sold.length,
    capacity: event.capacity,
    remaining: event.capacity - sold.length,
    occupancy,
    revenue
  });
}

// Belirli bir etkinliğin katılımcı listesi
function eventAttendees(req, res) {
  const { id } = req.params;
  const event = store.getById('events', id);
  if (!event) {
    return res.status(404).json({ error: `Etkinlik bulunamadı: ${id}` });
  }

  const tickets = store
    .getAll('tickets')
    .filter((t) => t.eventId === id && t.status !== 'cancelled');

  const attendees = tickets.map((t) => {
    const attendee = store.getById('attendees', t.attendeeId);
    return {
      ticketId: t.id,
      seat: t.seat,
      status: t.status,
      attendee: attendee || { id: t.attendeeId, name: 'Bilinmiyor' }
    };
  });

  res.json({
    event: event.title,
    count: attendees.length,
    attendees
  });
}

// Genel sistem özeti
function summary(req, res) {
  const events = store.getAll('events');
  const venues = store.getAll('venues');
  const attendees = store.getAll('attendees');
  const tickets = store.getAll('tickets').filter((t) => t.status !== 'cancelled');

  const revenue = tickets.reduce((sum, t) => sum + t.price, 0);
  const activeEvents = events.filter((e) => e.status === 'active').length;

  res.json({
    totalEvents: events.length,
    activeEvents,
    totalVenues: venues.length,
    totalAttendees: attendees.length,
    totalTicketsSold: tickets.length,
    totalRevenue: revenue
  });
}

module.exports = { eventSales, eventAttendees, summary };
