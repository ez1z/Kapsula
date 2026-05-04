# Database Schema

Kapsula uses PostgreSQL as its primary database. This document describes the schema structure.

## Entity Relationship Diagram

```
users ─────┬───── owns ──────── businesses
           │                        │
           │                        ├─────── has many ─────── business_hours
           │                        │
           │                        ├─────── has many ─────── services
           │                        │
           │                        └─────── has many ─────── staff
           │                                                   │
           │                                                   │
           └─────── makes ──────── bookings ◄───── belongs to ──── slots
                            │                        │
                            │                        ├─────── belongs to ──── staff
                            │                        │
                            │                        └─────── belongs to ──── services
                            │
                            └─────── belongs to ──── users (customer)
```

## Tables

### users

Stores user accounts with different roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Login phone number |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | Display name |
| role | VARCHAR(20) | NOT NULL | `customer`, `business`, `admin` |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_users_phone` - Fast login lookup

---

### businesses

Business profiles owned by business users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| name | VARCHAR(100) | NOT NULL | Business name |
| type | VARCHAR(20) | NOT NULL | `barber`, `cafe`, `salon` |
| phone | VARCHAR(20) | NOT NULL | Contact phone |
| address | VARCHAR(255) | | Physical address |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Ashgabat' | Business timezone |
| owner_id | INTEGER | REFERENCES users(id) | Owner user ID |
| is_active | BOOLEAN | DEFAULT true | Admin activation |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_businesses_owner` - Find businesses by owner

---

### business_hours

Operating hours for each day of the week.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| business_id | INTEGER | REFERENCES businesses(id) | Business ID |
| day_of_week | INTEGER | NOT NULL | 1=Monday, 7=Sunday |
| open_time | TIME | | Opening time |
| close_time | TIME | | Closing time |
| is_day_off | BOOLEAN | DEFAULT false | Closed all day |

---

### services

Services offered by businesses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| business_id | INTEGER | REFERENCES businesses(id) | Business ID |
| name | VARCHAR(100) | NOT NULL | Service name |
| duration_minutes | INTEGER | NOT NULL | Service duration |
| price | DECIMAL(10,2) | NOT NULL | Service price |
| service_type | VARCHAR(20) | NOT NULL | Type classification |
| max_capacity | INTEGER | DEFAULT 1 | Max concurrent bookings |
| is_active | BOOLEAN | DEFAULT true | Service availability |

**Indexes:**
- `idx_services_business` - Find services by business

---

### staff

Staff members who can perform services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| business_id | INTEGER | REFERENCES businesses(id) | Business ID |
| name | VARCHAR(100) | NOT NULL | Staff name |
| phone | VARCHAR(20) | | Contact phone |
| color | VARCHAR(7) | | Hex color for UI |
| is_active | BOOLEAN | DEFAULT true | Staff availability |

**Indexes:**
- `idx_staff_business` - Find staff by business

---

### slots

Bookable time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| business_id | INTEGER | REFERENCES businesses(id) | Business ID |
| staff_id | INTEGER | REFERENCES staff(id) | Assigned staff |
| service_id | INTEGER | REFERENCES services(id) | Service type |
| starts_at | TIMESTAMP | NOT NULL | Slot start time |
| ends_at | TIMESTAMP | NOT NULL | Slot end time |
| status | VARCHAR(20) | DEFAULT 'available' | `available`, `locked`, `booked` |
| max_capacity | INTEGER | DEFAULT 1 | Max concurrent bookings |
| booking_count | INTEGER | DEFAULT 0 | Current bookings |

**Indexes:**
- `idx_slots_business_staff_time` - Complex lookup for availability
- `idx_slots_starts_at_status` - Find available slots

---

### bookings

Customer reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| slot_id | INTEGER | REFERENCES slots(id) | Booked slot |
| customer_id | INTEGER | REFERENCES users(id) | Customer user ID |
| customer_name | VARCHAR(100) | NOT NULL | Customer display name |
| customer_phone | VARCHAR(20) | NOT NULL | Customer phone |
| status | VARCHAR(20) | DEFAULT 'pending' | `pending`, `confirmed`, `cancelled`, `no_show` |
| notes | TEXT | | Special requests |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking timestamp |

**Indexes:**
- `idx_bookings_customer_phone` - Find customer bookings
- `idx_bookings_slot` - Find bookings by slot

---

## Migrations

Migrations are stored in `backend/migrations/` as SQL files:

- `001_initial_schema.sql` - Creates all tables and indexes
- `002_seed.sql` - Populates test data

## Slot Locking Mechanism

Redis is used to implement short-term slot locks:

1. When a customer starts checkout, slot is locked for 5 minutes
2. Lock key format: `slot_lock:{slot_id}`
3. Value contains `{ customerId, lockId, expiresAt }`
4. Lock is released on unlock, timeout, or booking completion

## Seed Data

The seed file creates:

### Users
- 1 Admin user (650000001)
- 2 Business owners (650000002, 650000003)
- 1 Customer user (650000003)

### Businesses
- Premium Barbershop (barber type)
- Cozy Cafe (cafe type)

### Services
- Haircut, Beard Trim, Shave (Barbershop)
- Coffee, Pastry, Lunch (Cafe)

### Staff
- John Smith, Mike Johnson (Barbershop)
- Anna Williams, Maria Garcia (Cafe)

All seed users have password: `password123`