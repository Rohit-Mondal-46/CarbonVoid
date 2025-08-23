const express = require('express');
const ReportController = require('../controllers/reportController');

const router = express.Router();

router.get('/:userId', ReportController.getCarbonReport);
router.get('/:userId/pdf', ReportController.downloadPDFReport);

module.exports = router;
