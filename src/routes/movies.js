const express = require('express');
const router = express.Router();
const client = require('../services/kartoonsClient');

const getHeaders = (req) => {
  const h = {};
  const token = req.headers['x-challenge-token'] || req.query.challenge_token;
  if (token) h['X-Challenge-Token'] = token;
  if (req.headers.authorization) h['Authorization'] = req.headers.authorization;
  return h;
};

router.get('/', async (req, res) => {
  try {
    const r = await client.getMovies(req.query, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const r = await client.getFeaturedMovies(getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/links', async (req, res) => {
  try {
    const r = await client.getMovieLinks(req.params.id, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/stream', async (req, res) => {
  try {
    const [movie, links] = await Promise.all([
      client.getMovieById(req.params.id, getHeaders(req)),
      client.getMovieLinks(req.params.id, getHeaders(req))
    ]);
    res.json({
      success: links.ok,
      movie: movie.data?.data || null,
      stream: links.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await client.getMovieById(req.params.id, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
