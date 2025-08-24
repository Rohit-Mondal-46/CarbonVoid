const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoute');
const activityRoutes = require('./routes/activityRoute');
const reportRoutes = require('./routes/reportRoute');
const suggestionRoutes = require('./routes/suggetionRoute');
const emissionRoutes = require('./routes/emmisiontimeRoute');
const declutterRoutes = require('./routes/declutterRoutes');
const chatRoutes = require('./routes/chatRoute');
const activitystateRoutes = require('./routes/activitystateRoute');
const auth = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// cors
app.use(
  cors({
    origin: [
      'chrome-extension://knlpkbjmcaejnlidhefojemkkpbfncig', // from `chrome://extensions`
      'http://localhost:5173' // dev frontend
    ],
    credentials: true
    
  })
);

// routes
app.use('/api/auth', auth);
app.use('/api/user', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/declutters', declutterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/activitystate', activitystateRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
