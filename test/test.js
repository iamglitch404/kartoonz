const assert = require('assert');
const { solveProofOfWork } = require('../src/utils/powSolver');
const { decryptUrl } = require('../src/utils/decryptor');
const client = require('../src/services/kartoonsClient');

async function run() {
  const pow = solveProofOfWork('test_' + Date.now(), 12);
  assert(pow.solution, 'pow solution missing');

  assert.strictEqual(decryptUrl('https://example.com/stream.m3u8'), 'https://example.com/stream.m3u8');

  const shows = await client.getShows({ page: 1, limit: 2 });
  assert(shows.ok && Array.isArray(shows.data?.data), 'shows fetch failed');

  const search = await client.searchUnified('naruto', 2);
  assert(search.success && (search.data.shows.length > 0 || search.data.movies.length > 0), 'search failed');

  console.log('all tests passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
