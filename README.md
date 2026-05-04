# Kapsula

A multi-user reservation and booking platform built with Vue.js and Fastify. Kapsula allows businesses like barbershops, cafes, and salons to manage appointments while customers can browse and book slots online.

## Features

- **Multi-role authentication** - Customer, Business Owner, and Admin roles with JWT
- **Business management** - Create and manage businesses with custom hours and services
- **Slot generation** - Automatic time slot creation with capacity support
- **Real-time slot locking** - Redis-based 5-minute slot locks to prevent double-booking
- **Booking workflow** - Full booking lifecycle (pending, confirmed, cancelled, no-show)
- **Internationalization** - Supports Turkmen, Russian, Turkish, and English
- **Docker-ready** - Full containerized setup with PostgreSQL, Redis, and Nginx

## Tech Stack

### Frontend
- Vue.js 3.4+
- Vue Router 4.2+
- Pinia (state management)
- Vue I18n (internationalization)
- Axios (HTTP client)
- Vite 5.0 (build tool)

### Backend
- Node.js 18+
- Fastify 4.26+
- PostgreSQL 16
- Redis 7
- JWT authentication

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)

## Project Structure

```
kapsula/
├── frontend/           # Vue.js SPA
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── views/       # Page components (admin, business, customer)
│   │   ├── stores/       # Pinia state stores
│   │   ├── router/      # Vue Router configuration
│   │   └── i18n/        # Localization files
│   └── vite.config.js
├── backend/            # Fastify REST API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── plugins/     # Fastify plugins (db, redis)
│   │   ├── config/      # Configuration
│   │   └── utils/       # Utilities
│   └── migrations/      # SQL schema & seed data
├── nginx/              # Nginx configuration
├── docs/               # Documentation
└── docker-compose.yml  # Docker orchestration
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (if running locally)
- Redis 7 (if running locally)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/kapsula.git
cd kapsula

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec api npm run seed
```

The application will be available at `http://localhost`

### Manual Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

After running seeds, use these test accounts:

| Role | Phone | Password |
|------|-------|----------|
| Admin | 650000001 | password123 |
| Business Owner | 650000002 | password123 |
| Customer | 650000003 | password123 |

## Configuration

Environment variables are defined in `.env.example`:

```env
# Database
DATABASE_URL=postgresql://kapsula:kapsula_secret@postgres:5432/kapsula

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Business Defaults
DEFAULT_TIMEZONE=Asia/Ashgabat

# Frontend
VITE_API_BASE_URL=/api
VITE_APP_NAME=Kapsula
```

## API Documentation

See [docs/api-reference.md](docs/api-reference.md) for full API documentation.

### Authentication

```bash
# Register
POST /api/auth/register
{ "phone": "123456789", "password": "secret", "name": "John", "role": "customer" }

# Login
POST /api/auth/login
{ "phone": "123456789", "password": "secret" }

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/businesses | List all businesses |
| POST | /api/businesses | Create business (authenticated) |
| GET | /api/businesses/:id/slots | Get available slots |
| POST | /api/slots/:id/lock | Lock slot for booking |
| POST | /api/bookings | Create booking |
| GET | /api/admin/stats | Platform statistics (admin) |

## Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm start        # Start production server
npm run dev      # Start with hot reload
npm run seed     # Seed database
```

## Documentation

- [Getting Started](docs/getting-started.md) - Detailed setup guide
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Database Schema](docs/database-schema.md) - Database structure
- [Contributing Guide](docs/contributing.md) - How to contribute

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    Nginx    │────▶│  Fastify    │
│  (Vue.js)   │     │   (Proxy)   │     │    API      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │    Redis    │◀───▶│ PostgreSQL  │
                    │   (Locks)   │     │    (Data)   │
                    └─────────────┘     └─────────────┘
```

## Database Schema

Main tables:
- `users` - User accounts with roles
- `businesses` - Business profiles
- `business_hours` - Operating hours per day
- `services` - Services offered by businesses
- `staff` - Staff members
- `slots` - Bookable time slots
- `bookings` - Customer reservations

See [docs/database-schema.md](docs/database-schema.md) for details.

## Internationalization

Kapsula supports 4 languages:
- Turkmen (tk) - Default
- Russian (ru)
- Turkish (tr)
- English (en)

Translation files are in `frontend/src/i18n/locales/`.

## Contributing

Contributions are welcome! Please see [docs/contributing.md](docs/contributing.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms included in the [LICENSE](LICENSE) file.