const express = require('express');
const { getTimeBasedEmissions, getServiceWiseEmissions } = require('../controllers/emissiontimeController');

const router = express.Router();

// Correct route registration
router.get('/:userId/emissions/services', getServiceWiseEmissions);
router.get('/:userId/emissions/:timeframe', getTimeBasedEmissions);

module.exports = router;
