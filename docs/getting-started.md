# Getting Started

This guide will help you set up Kapsula locally for development.

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **PostgreSQL** 16
- **Redis** 7
- **Git**

## Clone the Repository

```bash
git clone https://github.com/your-org/kapsula.git
cd kapsula
```

## Environment Setup

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database and Redis connection details:

```env
DATABASE_URL=postgresql://kapsula:kapsula_secret@localhost:5432/kapsula
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-to-a-random-64-character-string
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
DEFAULT_TIMEZONE=Asia/Ashgabat
```

### 2. Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE kapsula;

# Create the user
CREATE USER kapsula WITH PASSWORD 'kapsula_secret';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kapsula TO kapsula;
```

### 3. Run Migrations

```bash
cd backend
psql -U kapsula -d kapsula -f migrations/001_initial_schema.sql
```

### 4. Seed Data (Optional)

```bash
psql -U kapsula -d kapsula -f migrations/002_seed.sql
```

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3000`.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Using Docker

If you prefer Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

## Using the Application

### Test Accounts

After seeding, you can use these accounts:

| Role | Phone | Password |
|------|-------|----------|
| Admin | 650000001 | password123 |
| Business Owner | 650000002 | password123 |
| Customer | 650000003 | password123 |

### Test Businesses

Two sample businesses are created during seeding:

1. **Premium Barbershop** (Barber type)
   - Address: 123 Main Street, Ashgabat
   - Services: Haircut, Beard Trim, Shave

2. **Cozy Cafe** (Cafe type)
   - Address: 456 Oak Avenue, Ashgabat
   - Services: Coffee, Pastry, Lunch

## Development Workflow

### Project Structure

```
kapsula/
├── frontend/           # Vue.js SPA
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── views/     # Page views by role
│   │   ├── stores/    # Pinia state management
│   │   ├── router/    # Vue Router config
│   │   └── i18n/      # Translations
├── backend/            # Fastify REST API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── plugins/   # Fastify plugins
│   │   └── utils/     # Utilities
│   └── migrations/    # SQL files
├── nginx/              # Nginx config
└── docs/               # Documentation
```

### Adding New Features

1. **Backend Routes**: Add route handlers in `backend/src/routes/`
2. **Frontend Views**: Add Vue components in `frontend/src/views/`
3. **Database Changes**: Create new migration files in `backend/migrations/`

### Code Style

- Backend follows standard Node.js conventions
- Frontend follows Vue.js 3 Composition API patterns
- Use meaningful variable and function names

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### Redis Connection Issues

Ensure Redis is running and `REDIS_URL` is correct.

### Port Already in Use

```bash
# Find and kill process using port
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### Migration Failed

Check that the database user has proper permissions and the database exists.

## Next Steps

- Read the [API Reference](api-reference.md) to understand all endpoints
- Review the [Database Schema](database-schema.md) for data structure
- Check the [Contributing Guide](contributing.md) before submitting changes