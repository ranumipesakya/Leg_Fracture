const express = require('express');
const { listRecords, createRecord, deleteRecord } = require('../controllers/recordController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, listRecords);
router.post('/', requireAuth, createRecord);
router.delete('/:id', requireAuth, deleteRecord);

module.exports = router;
