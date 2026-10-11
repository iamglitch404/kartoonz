const config = require('../config');
const { solveProofOfWork } = require('../utils/powSolver');
const { decryptLinks } = require('../utils/decryptor');

class KartoonsClient {
  constructor() {
    this.baseUrl = config.upstreamBaseUrl;
    this.origin = config.upstreamOrigin;
    this.userAgent = config.userAgent;
    this.queueSession = null;
    this.challengeToken = config.defaultChallengeToken;
  }

  setChallengeToken(token) {
    this.challengeToken = token;
  }

  buildHeaders(custom = {}) {
    const headers = {
      'User-Agent': this.userAgent,
      'Origin': this.origin,
      'Referer': `${this.origin}/`,
      'Accept': 'application/json, text/plain, */*'
    };

    if (this.queueSession) {
      headers['X-Queue-Session'] = this.queueSession;
    }

    const token = custom['x-challenge-token'] || custom['X-Challenge-Token'] || this.challengeToken;
    if (token) headers['X-Challenge-Token'] = token;

    const auth = custom['authorization'] || custom['Authorization'] || (config.defaultAuthToken ? `Bearer ${config.defaultAuthToken}` : null);
    if (auth) headers['Authorization'] = auth;

    for (const [k, v] of Object.entries(custom)) {
      if (v && !['host', 'connection', 'content-length'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    }

    return headers;
  }

  updateSession(res) {
    const sid = res.headers.get('x-queue-session');
    if (sid) this.queueSession = sid;

    const cookie = res.headers.get('set-cookie');
    if (cookie && cookie.includes('tq_sid=')) {
      const match = cookie.match(/tq_sid=([^;]+)/);
      if (match) this.queueSession = match[1];
    }
  }

  async request(path, options = {}) {
    const { method = 'GET', params = {}, body = null, headers: customHeaders = {} } = options;
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }

    const headers = this.buildHeaders(customHeaders);
    const fetchOpts = { method, headers };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      headers['Content-Type'] = 'application/json';
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOpts);
    this.updateSession(res);

    const ctype = res.headers.get('content-type') || '';
    const data = ctype.includes('application/json') ? await res.json() : await res.text();

    return { status: res.status, ok: res.ok, data };
  }

  async getAndSolvePoW(contentRef) {
    const pow = await this.request('/challenge/pow', { params: { content: contentRef } });
    const pdata = pow.data?.data;
    if (!pow.ok || !pdata) return null;
    if (pdata.enabled === false) return null;
    if (!pdata.nonce || typeof pdata.bits !== 'number') return null;

    const res = solveProofOfWork(pdata.nonce, pdata.bits);
    return { nonce: pdata.nonce, solution: res.solution };
  }

  getShows(params, headers) {
    return this.request('/shows', { params, headers });
  }

  getFeaturedShows(headers) {
    return this.request('/shows/featured', { headers });
  }

  getShowById(id, headers) {
    return this.request(`/shows/${id}`, { headers });
  }

  getShowSeasonEpisodes(showId, seasonId, params, headers) {
    return this.request(`/shows/${showId}/season/${seasonId}/episodes`, { params, headers });
  }

  getShowSeasonAllEpisodes(showId, seasonId, headers) {
    return this.request(`/shows/${showId}/season/${seasonId}/all-episodes`, { headers });
  }

  getEpisodeById(id, headers) {
    return this.request(`/shows/episode/${id}`, { headers });
  }

  async getEpisodeLinks(id, headers = {}) {
    const reqHeaders = { ...headers };
    try {
      const pow = await this.getAndSolvePoW(`episode:${id}`);
      if (pow) {
        reqHeaders['X-Pow-Nonce'] = pow.nonce;
        reqHeaders['X-Pow-Solution'] = pow.solution;
      }
    } catch {}

    const res = await this.request(`/shows/episode/${id}/links`, { headers: reqHeaders });
    if (res.ok && res.data?.data) {
      res.data.data = decryptLinks(res.data.data);
    }
    return res;
  }

  getMovies(params, headers) {
    return this.request('/movies', { params, headers });
  }

  getFeaturedMovies(headers) {
    return this.request('/movies/featured', { headers });
  }

  getMovieById(id, headers) {
    return this.request(`/movies/${id}`, { headers });
  }

  async getMovieLinks(id, headers = {}) {
    const reqHeaders = { ...headers };
    try {
      const pow = await this.getAndSolvePoW(`movie:${id}`);
      if (pow) {
        reqHeaders['X-Pow-Nonce'] = pow.nonce;
        reqHeaders['X-Pow-Solution'] = pow.solution;
      }
    } catch {}

    const res = await this.request(`/movies/${id}/links`, { headers: reqHeaders });
    if (res.ok && res.data?.data) {
      res.data.data = decryptLinks(res.data.data);
    }
    return res;
  }

  getTrending(params, headers) {
    return this.request('/popularity/trending', { params, headers });
  }

  getPopularMovies(params, headers) {
    return this.request('/popularity/movies', { params, headers });
  }

  getPopularShows(params, headers) {
    return this.request('/popularity/shows', { params, headers });
  }

  async searchUnified(query, limit = 20) {
    const q = (query || '').trim();
    if (!q) {
      return { success: true, query: '', data: { shows: [], movies: [] } };
    }

    const [shows, movies] = await Promise.all([
      this.getShows({ search: q, limit }),
      this.getMovies({ search: q, limit })
    ]);

    const showList = shows.data?.data || [];
    const movieList = movies.data?.data || [];

    return {
      success: true,
      query: q,
      total: showList.length + movieList.length,
      data: {
        shows: showList,
        movies: movieList
      }
    };
  }

  getDeviceCode() {
    return this.request('/app/device/code', { method: 'POST', body: {} });
  }

  getDeviceStatus(code) {
    return this.request('/app/device/status', { params: { code, fullinfo: 'true' } });
  }

  linkDevice(code, token) {
    return this.request('/app/device/link', { method: 'POST', body: { code, token } });
  }
}

module.exports = new KartoonsClient();
