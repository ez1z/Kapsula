# API Reference

Complete reference for the Kapsula REST API.

## Base URL

- Development: `http://localhost:3000`
- Production: Configured via Nginx reverse proxy

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

Success response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user.

**Body:**
```json
{
  "phone": "1234567890",
  "password": "secretpassword",
  "name": "John Doe",
  "role": "customer"
}
```

**Roles:** `customer`, `business`

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "phone": "1234567890",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

---

#### POST /api/auth/login

Login with phone and password.

**Body:**
```json
{
  "phone": "1234567890",
  "password": "secretpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "phone": "1234567890",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

---

#### GET /api/auth/me

Get the authenticated user.

**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "phone": "1234567890",
    "name": "John Doe",
    "role": "customer"
  }
}
```

---

### Businesses

#### GET /api/businesses

List all active businesses.

**Query Parameters:**
- `type` (optional): Filter by type (`barber`, `cafe`, `salon`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Barbershop",
      "type": "barber",
      "phone": "123456789",
      "address": "123 Main Street",
      "timezone": "Asia/Ashgabat",
      "isActive": true,
      "hours": [
        { "dayOfWeek": 1, "openTime": "09:00", "closeTime": "18:00", "isDayOff": false }
      ],
      "services": [...]
    }
  ]
}
```

---

#### GET /api/businesses/:id

Get business details.

**Parameters:**
- `id`: Business ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Premium Barbershop",
    "type": "barber",
    "phone": "123456789",
    "address": "123 Main Street",
    "timezone": "Asia/Ashgabat",
    "isActive": true,
    "hours": [...],
    "services": [...],
    "staff": [...]
  }
}
```

---

#### POST /api/businesses

Create a new business.

**Requires:** Authentication (role: business)

**Body:**
```json
{
  "name": "My Business",
  "type": "cafe",
  "phone": "123456789",
  "address": "456 Oak Avenue"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "My Business",
    "type": "cafe",
    "phone": "123456789",
    "address": "456 Oak Avenue",
    "ownerId": 2,
    "isActive": true
  }
}
```

---

#### PUT /api/businesses/:id

Update a business.

**Requires:** Authentication (role: business, owner of the business)

---

#### GET /api/businesses/:id/slots

Get available slots for a business.

**Parameters:**
- `id`: Business ID

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (defaults to today)
- `serviceId`: Filter by service ID
- `staffId`: Filter by staff ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "staffId": 1,
      "serviceId": 1,
      "startsAt": "2024-01-15T09:00:00Z",
      "endsAt": "2024-01-15T09:30:00Z",
      "status": "available",
      "maxCapacity": 1,
      "bookingCount": 0
    }
  ]
}
```

---

#### POST /api/businesses/:id/slots/generate

Generate time slots for a business.

**Requires:** Authentication (role: business, owner of the business)

**Body:**
```json
{
  "date": "2024-01-15",
  "staffId": 1,
  "serviceId": 1,
  "interval": 30
}
```

---

### Services

#### GET /api/services

List all services.

**Query Parameters:**
- `businessId`: Filter by business

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "name": "Haircut",
      "durationMinutes": 30,
      "price": 25.00,
      "serviceType": "barber",
      "maxCapacity": 1,
      "isActive": true
    }
  ]
}
```

---

#### POST /api/services

Create a service.

**Requires:** Authentication (role: business)

**Body:**
```json
{
  "businessId": 1,
  "name": "Haircut",
  "durationMinutes": 30,
  "price": 25.00,
  "serviceType": "barber",
  "maxCapacity": 1
}
```

---

### Staff

#### GET /api/staff

List staff members.

**Query Parameters:**
- `businessId`: Filter by business

---

#### POST /api/staff

Create a staff member.

**Requires:** Authentication (role: business)

**Body:**
```json
{
  "businessId": 1,
  "name": "John Smith",
  "phone": "123456789",
  "color": "#FF5733"
}
```

---

### Slots

#### POST /api/slots/:id/lock

Lock a slot for 5 minutes (prevents double-booking).

**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "lockId": "lock_abc123",
    "expiresAt": "2024-01-15T09:05:00Z"
  }
}
```

---

#### POST /api/slots/:id/unlock

Release a slot lock.

**Requires:** Authentication

---

### Bookings

#### POST /api/bookings

Create a booking.

**Requires:** Authentication

**Body:**
```json
{
  "slotId": 1,
  "customerName": "Jane Doe",
  "customerPhone": "9876543210",
  "notes": "First visit"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slotId": 1,
    "customerId": 1,
    "customerName": "Jane Doe",
    "customerPhone": "9876543210",
    "status": "pending",
    "createdAt": "2024-01-14T12:00:00Z"
  }
}
```

---

#### GET /api/bookings

Get user's bookings.

**Requires:** Authentication

**Query Parameters:**
- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `no_show`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slot": {
        "startsAt": "2024-01-15T09:00:00Z",
        "business": { "name": "Premium Barbershop" },
        "service": { "name": "Haircut" }
      },
      "status": "pending",
      "customerName": "Jane Doe"
    }
  ]
}
```

---

#### PUT /api/bookings/:id/confirm

Confirm a booking.

**Requires:** Authentication (role: business)

---

#### PUT /api/bookings/:id/cancel

Cancel a booking.

**Requires:** Authentication (customer who booked or business owner)

---

#### PUT /api/bookings/:id/no-show

Mark customer as no-show.

**Requires:** Authentication (role: business)

---

### Admin

#### GET /api/admin/stats

Get platform statistics.

**Requires:** Authentication (role: admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBusinesses": 10,
    "totalUsers": 50,
    "totalBookings": 100,
    "pendingBookings": 5
  }
}
```

---

#### PUT /api/businesses/:id/activate

Activate a business.

**Requires:** Authentication (role: admin)

---

#### PUT /api/businesses/:id/deactivate

Deactivate a business.

**Requires:** Authentication (role: admin)

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid JWT token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `SLOT_LOCKED` | Slot is currently locked by another user |
| `SLOT_UNAVAILABLE` | Slot is no longer available |
| `DUPLICATE_ENTRY` | Resource already exists |

## Rate Limiting

No rate limiting is currently enforced in development. In production, Nginx should be configured for rate limiting.