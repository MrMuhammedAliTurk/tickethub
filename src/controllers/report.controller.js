const service = require('../services/report.service');
const { adapt } = require('./controllerAdapter');

module.exports = {
  eventSales: adapt(service.eventSales, (req) => [req.params.id]),
  eventAttendees: adapt(service.eventAttendees, (req) => [req.params.id]),
  summary: adapt(service.summary, () => [])
};
