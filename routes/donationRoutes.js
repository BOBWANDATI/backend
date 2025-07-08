// === routes/donationRoutes.js ===
const express = require('express');
const router = express.Router();
const { stkPush } = require('../controllers/donationController');

// POST /api/donations/stk
router.post('/stk', stkPush);

module.exports = router;
