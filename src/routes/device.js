const express = require('express');
const router = express.Router();
const client = require('../services/kartoonsClient');

router.post('/code', async (req, res) => {
  try {
    const r = await client.getDeviceCode();
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'code required' });
    }

    const r = await client.getDeviceStatus(code);
    if (r.ok && r.data?.token) {
      client.setChallengeToken(r.data.token);
    }

    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/link', async (req, res) => {
  try {
    const { code, token } = req.body;
    if (!code || !token) {
      return res.status(400).json({ error: 'code and token required' });
    }

    const r = await client.linkDevice(code, token);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'token required' });
  }

  client.setChallengeToken(token);
  res.json({ ok: true });
});

module.exports = router;
