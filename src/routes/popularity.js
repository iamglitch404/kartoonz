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

router.get('/trending', async (req, res) => {
  try {
    const params = {
      limit: parseInt(req.query.limit, 10) || 15,
      period: req.query.period || 'week',
    };
    if (req.query.category) params.category = req.query.category;

    const r = await client.getTrending(params, getHeaders(req));

    if (!r.ok && r.status === 403 && req.query.fallback === 'true') {
      const [shows, movies] = await Promise.all([
        client.getFeaturedShows(getHeaders(req)),
        client.getFeaturedMovies(getHeaders(req)),
      ]);
      return res.json({
        success: true,
        fallback: true,
        data: {
          shows: shows.data?.data || [],
          movies: movies.data?.data || [],
        },
      });
    }

    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/movies', async (req, res) => {
  try {
    const params = {
      limit: parseInt(req.query.limit, 10) || 15,
      period: req.query.period || 'week',
    };
    if (req.query.category) params.category = req.query.category;

    const r = await client.getPopularMovies(params, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shows', async (req, res) => {
  try {
    const params = {
      limit: parseInt(req.query.limit, 10) || 15,
      period: req.query.period || 'week',
    };
    if (req.query.category) params.category = req.query.category;

    const r = await client.getPopularShows(params, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
