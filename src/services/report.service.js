const store = require('../data/store');
const { success, failure } = require('./result');

function eventSales(id) {
  const event = store.getById('events', id);
  if (!event) return failure(404, `Etkinlik bulunamadı: ${id}`);
  const sold = store.getAll('tickets').filter((ticket) => ticket.eventId === id && ticket.status !== 'cancelled');
  const revenue = sold.reduce((sum, ticket) => sum + ticket.price, 0);
  const occupancy = ((sold.length / event.capacity) * 100).toFixed(1) + '%';
  return success({ event: { id: event.id, title: event.title }, sold: sold.length, capacity: event.capacity, remaining: event.capacity - sold.length, occupancy, revenue });
}

function eventAttendees(id) {
  const event = store.getById('events', id);
  if (!event) return failure(404, `Etkinlik bulunamadı: ${id}`);
  const tickets = store.getAll('tickets').filter((ticket) => ticket.eventId === id && ticket.status !== 'cancelled');
  const attendees = tickets.map((ticket) => {
    const attendee = store.getById('attendees', ticket.attendeeId);
    return { ticketId: ticket.id, seat: ticket.seat, status: ticket.status, attendee: attendee || { id: ticket.attendeeId, name: 'Bilinmiyor' } };
  });
  return success({ event: event.title, count: attendees.length, attendees });
}

function summary() {
  const events = store.getAll('events');
  const venues = store.getAll('venues');
  const attendees = store.getAll('attendees');
  const tickets = store.getAll('tickets').filter((ticket) => ticket.status !== 'cancelled');
  const revenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  return success({ totalEvents: events.length, activeEvents: events.filter((event) => event.status === 'active').length, totalVenues: venues.length, totalAttendees: attendees.length, totalTicketsSold: tickets.length, totalRevenue: revenue });
}

module.exports = { eventSales, eventAttendees, summary };
