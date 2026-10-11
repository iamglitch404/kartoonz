# kartoonz api

simple rest api for kartoons content.

## setup

```bash
npm install
npm start
```

dev mode with watch:
```bash
npm run dev
```

## endpoints

### search
- `GET /api/search?q=naruto&limit=20`

### shows
- `GET /api/shows` (params: `page`, `limit`, `search`, `category`)
- `GET /api/shows/featured`
- `GET /api/shows/:id`
- `GET /api/shows/:id/season/:seasonId/episodes`
- `GET /api/shows/episode/:id`
- `GET /api/shows/episode/:id/links`

### movies
- `GET /api/movies`
- `GET /api/movies/featured`
- `GET /api/movies/:id`
- `GET /api/movies/:id/links`

### trending
- `GET /api/popularity/trending?fallback=true`

### device login
- `POST /api/device/code`
- `GET /api/device/status?code=<code>`

## tests

```bash
npm test
```
