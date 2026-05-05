# Kapsula - Quick Context Reference

**Kapsula** is a multi-user reservation/booking platform for Turkmenistan, running on Turkmen Telekom VMs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue.js 3.4, Vue Router 4.2, Pinia 2.1, Vue I18n 9.9, Vite 5.0, Axios 1.6 |
| Backend | Node.js 18+, Fastify 4.26, PostgreSQL 16, Redis 7 |
| Infra | Docker, Nginx |

## Project Structure

```
kapsula/
├── frontend/           # Vue.js SPA (port 5173 dev, serves from /dist prod)
│   └── src/
│       ├── components/  # UI components (admin/, business/, common/, customer/)
│       ├── views/       # Pages (admin/, business/, customer/)
│       ├── stores/      # Pinia (auth.js, business.js)
│       ├── router/      # Vue Router
│       └── i18n/        # Locales (en, ru, tk, tr)
├── backend/            # Fastify API (port 3000)
│   └── src/
│       ├── routes/      # auth, businesses, services, slots, bookings, admin
│       ├── services/    # slot-locker.js
│       ├── plugins/     # db.js (pg), redis.js (ioredis)
│       ├── config/      # Environment loading
│       └── utils/       # errors.js
├── nginx/               # Reverse proxy config
├── docs/                # Documentation
├── docker-compose.yml   # 4 services: postgres, redis, api, nginx
└── .env.example         # Environment template
```

## Key Files

| Purpose | File |
|---------|------|
| Frontend entry | `frontend/src/main.js` |
| Backend entry | `backend/src/server.js` |
| Fastify app | `backend/src/app.js` |
| Database schema | `backend/migrations/001_initial_schema.sql` |
| Seed data | `backend/migrations/002_seed.sql` |
| API base config | `frontend/src/assets/main.js` (axios instance) |
| Docker compose | `docker-compose.yml` |
| Nginx proxy | `nginx/default.conf` |

## Environment Variables

```env
DATABASE_URL=postgresql://kapsula:kapsula_secret@postgres:5432/kapsula
REDIS_URL=redis://redis:6379
NODE_ENV=development
PORT=3000
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=7d
DEFAULT_TIMEZONE=Asia/Ashgabat
VITE_API_BASE_URL=/api
VITE_APP_NAME=Kapsula
```

## Default Test Credentials

| Role | Phone | Password |
|------|-------|----------|
| Admin | 650000001 | password123 |
| Business Owner | 650000002 | password123 |
| Customer | 650000003 | password123 |

## Important Notes

- **Timezone**: Default is `Asia/Ashgabat` (UTC+5)
- **Languages**: Turkmen (tk) default, Russian (ru), Turkish (tr), English (en)
- **Default Admin**: Role is `admin`, not `business`
- **Slot Lock Duration**: 5 minutes (Redis TTL)
- **Platform**: Local Turkmenistan network only, no external APIs