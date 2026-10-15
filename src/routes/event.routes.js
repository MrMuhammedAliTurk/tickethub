const express = require('express');
const controller = require('../controllers/event.controller');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(schemas.event), controller.create);
router.put('/:id', validate(schemas.optional(schemas.event)), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
