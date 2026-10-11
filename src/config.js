require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  upstreamBaseUrl: process.env.UPSTREAM_BASE_URL || 'https://api.kartoons.to/api',
  upstreamOrigin: 'https://kartoons.to',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  linkKey: 'bca9e0df1a5abb32906ca3f63ac04cef',
  defaultChallengeToken: process.env.DEFAULT_CHALLENGE_TOKEN || '',
  defaultAuthToken: process.env.DEFAULT_AUTH_TOKEN || ''
};
