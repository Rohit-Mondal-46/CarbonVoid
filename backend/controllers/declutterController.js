const DeclutterLog = require('../models/DeclutterLog'); // Mongoose model
const { fetchDeclutterSuggestions } = require('../services/DeclutterService');

const getDeclutterSuggestions = async (req, res) => {
  try {
    const suggestions = await fetchDeclutterSuggestions();

    // Save log in MongoDB
    const log = new DeclutterLog({ suggestions });
    await log.save();

    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get declutter suggestions.' });
  }
};

module.exports = { getDeclutterSuggestions };
