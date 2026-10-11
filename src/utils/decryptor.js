const crypto = require('crypto');
const config = require('../config');

const key = Buffer.from(config.linkKey.padEnd(32, ' ').slice(0, 32));

function decryptUrl(str) {
  if (!str || typeof str !== 'string' || str.startsWith('http')) {
    return str;
  }

  try {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);

    const buf = Buffer.from(b64, 'base64');
    if (buf.length <= 16) return str;

    const iv = buf.subarray(0, 16);
    const data = buf.subarray(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return str;
  }
}

function decryptLink(item) {
  if (!item || typeof item !== 'object') return item;
  const res = { ...item };
  if (res.url) res.url = decryptUrl(res.url);
  if (Array.isArray(res.subtitles)) {
    res.subtitles = res.subtitles.map(s => s?.url ? { ...s, url: decryptUrl(s.url) } : s);
  }
  return res;
}

function decryptLinks(data) {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(decryptLink);
  if (Array.isArray(data.links)) return { ...data, links: data.links.map(decryptLink) };
  return data;
}

module.exports = { decryptUrl, decryptLink, decryptLinks };
