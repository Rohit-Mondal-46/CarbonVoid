const express = require('express');
const { ActivityController } = require('../controllers/activityController');

const router = express.Router();

router.post('/activities', ActivityController.createActivity);
router.get('/activities/:userId/footprint', ActivityController.getCarbonFootprint);
router.get('/activities/:userId/breakdown', ActivityController.getEmissionsBreakdown);
router.get('/activities/:id', ActivityController.getActivity);

module.exports = router;
