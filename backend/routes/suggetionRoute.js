const express = require('express');
const { SuggestionController } = require('../controllers/suggetionController');

const router = express.Router();

// Wrap controller methods in proper middleware functions
router.post('/users/:userId/reports', (req, res) => SuggestionController.generateReport(req, res));
router.get('/users/:userId/reports', (req, res) => SuggestionController.getReports(req, res));

module.exports = router;
