const express = require('express');

const router = express.Router();

router.use('/events', require('./event.routes'));
router.use('/venues', require('./venue.routes'));
router.use('/attendees', require('./attendee.routes'));
router.use('/tickets', require('./ticket.routes'));
router.use('/reports', require('./report.routes'));

module.exports = router;
