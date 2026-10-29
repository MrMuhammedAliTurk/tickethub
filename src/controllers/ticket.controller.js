const service = require('../services/ticket.service');
const { adapt } = require('./controllerAdapter');

module.exports = {
  list: adapt(service.list, (req) => [req.query]),
  getById: adapt(service.getById, (req) => [req.params.id]),
  create: adapt(service.create, (req) => [req.body]),
  update: adapt(service.update, (req) => [req.params.id, req.body]),
  remove: adapt(service.remove, (req) => [req.params.id])
};
