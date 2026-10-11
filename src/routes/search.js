const express = require('express');
const router = express.Router();
const client = require('../services/kartoonsClient');

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || req.query.search || '';
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await client.searchUnified(q, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
