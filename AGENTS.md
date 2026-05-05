# Agent Instructions for Kapsula

This file contains instructions for AI agents working on the Kapsula codebase. All agents must follow these guidelines.

## Project Overview

**Kapsula** is a multi-user reservation/booking platform for Turkmenistan. It runs on Turkmen Telekom VM infrastructure and is designed for local network access only.

### Core Purpose
- Customers book appointments at service businesses (barbershops, cafes, salons)
- Business owners manage their schedules, services, and bookings
- Admins oversee the platform

### Key Constraints
- **Platform**: Local Turkmenistan network only (no external internet dependencies)
- **Infrastructure**: Turkmen Telekom VMs (Linux environment)
- **Timezone**: Default `Asia/Ashgabat` (UTC+5)
- **Default Language**: Turkmen (tk), with Russian (ru), Turkish (tr), English (en)
- **No External APIs**: Platform must be self-contained

---

## Codebase Architecture

### Directory Structure

```
kapsula/
├── frontend/              # Vue.js 3 SPA
│   ├── src/
│   │   ├── components/    # admin/, business/, common/, customer/
│   │   ├── views/         # admin/, business/, customer/
│   │   ├── stores/        # Pinia (auth.js, business.js)
│   │   ├── router/       # Vue Router config
│   │   └── i18n/          # Locale files (en, ru, tk, tr)
│   ├── vite.config.js
│   └── package.json
├── backend/               # Fastify REST API
│   ├── src/
│   │   ├── routes/        # auth.js, businesses.js, services.js, slots.js, bookings.js, admin.js
│   │   ├── services/      # slot-locker.js (Redis-based slot locking)
│   │   ├── plugins/       # db.js (pg), redis.js (ioredis)
│   │   ├── config/        # Environment loading
│   │   └── utils/         # errors.js (custom error classes)
│   ├── migrations/        # SQL schema (001_initial_schema.sql, 002_seed.sql)
│   ├── package.json
│   └── Dockerfile
├── nginx/                 # nginx.conf, default.conf
├── docs/                  # Documentation
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── AGENTS.md              # This file
└── CONTEXT.md             # Quick reference for sessions
```

### Technology Versions

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Vue.js | 3.4+ |
| Frontend | Vue Router | 4.2+ |
| Frontend | Pinia | 2.1+ |
| Frontend | Vue I18n | 9.9+ |
| Frontend | Vite | 5.0+ |
| Frontend | Axios | 1.6+ |
| Backend | Node.js | 18+ |
| Backend | Fastify | 4.26+ |
| Backend | PostgreSQL | 16 |
| Backend | Redis | 7 |

### Key File Locations

| Purpose | File Path |
|---------|-----------|
| Frontend entry | `frontend/src/main.js` |
| Frontend app root | `frontend/src/App.vue` |
| Backend entry | `backend/src/server.js` |
| Fastify app builder | `backend/src/app.js` |
| Database schema | `backend/migrations/001_initial_schema.sql` |
| Seed data | `backend/migrations/002_seed.sql` |
| Docker compose | `docker-compose.yml` |
| Nginx proxy config | `nginx/default.conf` |
| Documentation | `docs/` |

---

## Task Handling Protocol

### Breaking Down Tasks

When given a large task, ALWAYS break it into smaller subtasks and present them to the user for confirmation before proceeding.

**Example:**
```
Task: "Add dark mode to the application"

Breaking into subtasks:
1. Create dark mode toggle component
2. Add theme state management to Pinia store
3. Implement CSS variables for theme colors
4. Apply theme to main layout
5. Persist theme preference to localStorage
6. Update existing components to support theming

Do you want me to proceed? Which subtasks would you like me to start with?
```

### Per-Subtask Flow

1. **Confirm task scope** before starting
2. **Complete the subtask**
3. **Provide commit message** immediately after completion
4. **Wait for confirmation** before moving to next subtask
5. **Never auto-proceed** to next task

### Commit Message Format

Use **Conventional Commits** format:

```
<type>: <short description>

[type] options: feat | fix | docs | refactor | test | chore
```

**Examples:**
```
feat: add slot locking mechanism for booking flow
fix: resolve race condition in slot generation
docs: update API documentation for booking endpoints
refactor: extract slot validation logic into service
test: add unit tests for slot-locker service
chore: update Docker compose port mapping
```

---

## Production Guidelines

### Turkmen Telekom VM Considerations

- **Linux Environment**: Assume Linux server (no Windows-specific code)
- **Single Server Deployment**: PostgreSQL, Redis, API, and Nginx run on same VM
- **Local Network Only**: No external internet access required or expected
- **Fixed IP/Port**: Configure for Turkmen Telekom's network requirements

### Environment Configuration for Production

1. **JWT_SECRET**: Must be a strong, random 64-character string
2. **DATABASE_URL**: Local PostgreSQL connection string
3. **REDIS_URL**: Local Redis connection string
4. **NODE_ENV**: Set to `production`
5. **PORT**: Application port (default 3000)
6. **DEFAULT_TIMEZONE**: `Asia/Ashgabat`

### Docker Deployment

- All services containerized via docker-compose
- Services: postgres, redis, api, nginx
- Nginx handles reverse proxy and static file serving
- Ensure volume mounts for data persistence

### Security Considerations

- JWT tokens for authentication (no session cookies)
- Password hashing with bcrypt
- Role-based access control (customer, business, admin)
- No secrets in code (use environment variables)
- Validate all inputs on both frontend and backend

---

## Code Quality Standards

### When Uncertain

**DO NOT:**
- Guess answers or provide uncertain information
- Say "probably" or "I think" without certainty
- Make up APIs, file locations, or behavior
- Assume libraries are available without checking package.json

**DO:**
- Read the relevant files to confirm behavior
- Check package.json for available dependencies
- Ask follow-up questions if requirements are unclear
- Say "I need to verify this" and investigate

### When Requirements Are Unclear

Ask specific questions until you understand:

1. What is the expected input?
2. What is the expected output?
3. What should happen in edge cases?
4. Are there any constraints (performance, browser support, etc.)?

### Code Review Considerations

All code will be reviewed by other agents (Claude, Codex). Ensure:
- Code is clean and follows existing conventions
- No TODO comments left in code
- No debug statements or console.logs
- Proper error handling
- Type-safe where possible (check PropTypes, JSDoc)

---

## Important Notes

- **Slot Lock Duration**: 5 minutes (Redis TTL) - prevents double-booking
- **Default Admin Role**: `admin` (not `business`)
- **Timezone Handling**: Always use `date-fns-tz` for timezone conversions
- **Database Client**: Use `pg` library with prepared statements (no ORM)
- **Redis Client**: Use `ioredis`
- **No External Dependencies**: Platform must work without internet access

---

## Quick Reference

### Common Commands

```bash
# Docker
docker-compose up -d              # Start all services
docker-compose down                # Stop all services
docker-compose logs -f api         # View API logs

# Backend
cd backend && npm run dev          # Start dev server with hot reload
cd backend && npm start            # Start production server
cd backend && npm run seed         # Seed database

# Frontend
cd frontend && npm run dev         # Start dev server
cd frontend && npm run build       # Build for production
```

### Default Credentials

| Role | Phone | Password |
|------|-------|----------|
| Admin | 650000001 | password123 |
| Business Owner | 650000002 | password123 |
| Customer | 650000003 | password123 |

### Language Codes

- `tk` - Turkmen (default)
- `ru` - Russian
- `tr` - Turkish
- `en` - English

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CONTEXT.md` | Quick reference for session initialization |
| `docs/getting-started.md` | Local development setup |
| `docs/api-reference.md` | REST API documentation |
| `docs/database-schema.md` | Database structure |
| `docs/contributing.md` | Contribution guidelines |
| `COMMIT_CONVENTION.md` | Commit message reference |

---

**Last Updated**: 2026-05-05