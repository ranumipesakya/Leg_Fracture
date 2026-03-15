const express = require('express');
const { updateMe } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/me', requireAuth, updateMe);

module.exports = router;