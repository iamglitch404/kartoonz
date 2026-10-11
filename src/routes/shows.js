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
    const r = await client.getShows(req.query, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const r = await client.getFeaturedShows(getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/episode/:episodeId', async (req, res) => {
  try {
    const r = await client.getEpisodeById(req.params.episodeId, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/episode/:episodeId/links', async (req, res) => {
  try {
    const r = await client.getEpisodeLinks(req.params.episodeId, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/episode/:episodeId/stream', async (req, res) => {
  try {
    const [ep, links] = await Promise.all([
      client.getEpisodeById(req.params.episodeId, getHeaders(req)),
      client.getEpisodeLinks(req.params.episodeId, getHeaders(req))
    ]);
    res.json({
      success: links.ok,
      episode: ep.data?.data || null,
      stream: links.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await client.getShowById(req.params.id, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/season/:seasonId/episodes', async (req, res) => {
  try {
    const r = await client.getShowSeasonEpisodes(req.params.id, req.params.seasonId, req.query, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/season/:seasonId/all-episodes', async (req, res) => {
  try {
    const r = await client.getShowSeasonAllEpisodes(req.params.id, req.params.seasonId, getHeaders(req));
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
