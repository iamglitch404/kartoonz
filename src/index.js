const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    endpoints: [
      '/api/shows',
      '/api/shows/featured',
      '/api/shows/:id',
      '/api/shows/:id/season/:seasonId/episodes',
      '/api/shows/episode/:id',
      '/api/movies',
      '/api/movies/featured',
      '/api/movies/:id',
      '/api/search?q=',
      '/api/popularity/trending',
      '/api/device/code',
      '/api/health'
    ]
  });
});

app.use('/api/shows', require('./routes/shows'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/popularity', require('./routes/popularity'));
app.use('/api/search', require('./routes/search'));
app.use('/api/device', require('./routes/device'));
app.use('/api/health', require('./routes/health'));

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'server error' });
});

const server = app.listen(config.port, () => {
  console.log(`kartoonz api listening on http://localhost:${config.port}`);
});

module.exports = { app, server };
