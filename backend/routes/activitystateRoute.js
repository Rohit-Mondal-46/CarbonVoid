const express = require('express');
const { getActivityStats } = require('../controllers/activitystateController');

const router = express.Router();

router.get('/activity-stats/:userId', getActivityStats);

module.exports = router;
