const express = require('express');
const { getDeclutterSuggestions } = require('../controllers/declutterController');

const router = express.Router();

router.get('/declutter', getDeclutterSuggestions);

module.exports = router;
