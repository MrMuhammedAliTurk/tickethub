const express = require('express');
const controller = require('../controllers/report.controller');

const router = express.Router();

router.get('/summary', controller.summary);
router.get('/:id/sales', controller.eventSales);
router.get('/:id/attendees', controller.eventAttendees);

module.exports = router;
