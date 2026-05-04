import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { unlockSlot } from '../services/slot-locker.js';

export default async function bookingsRoutes(fastify) {
  fastify.get('/bookings', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    let query;
    const params = [request.user.id];

    if (request.user.role === 'customer') {
      query = `
        SELECT bk.*,
               s.starts_at, s.ends_at, s.business_id,
               bs.name as business_name, bs.address as business_address,
               sv.name as service_name, sv.price as service_price,
               st.name as staff_name
        FROM bookings bk
        JOIN slots s ON bk.slot_id = s.id
        JOIN businesses bs ON s.business_id = bs.id
        JOIN services sv ON s.service_id = sv.id
        LEFT JOIN staff st ON s.staff_id = st.id
        WHERE bk.customer_id = $1
        ORDER BY s.starts_at DESC
      `;
    } else if (request.user.role === 'business') {
      query = `
        SELECT bk.*,
               s.starts_at, s.ends_at, s.business_id,
               bs.name as business_name,
               sv.name as service_name, sv.price as service_price,
               st.name as staff_name
        FROM bookings bk
        JOIN slots s ON bk.slot_id = s.id
        JOIN businesses bs ON s.business_id = bs.id
        JOIN services sv ON s.service_id = sv.id
        LEFT JOIN staff st ON s.staff_id = st.id
        WHERE bs.owner_id = $1
        ORDER BY s.starts_at DESC
      `;
    } else {
      query = `
        SELECT bk.*,
               s.starts_at, s.ends_at, s.business_id,
               bs.name as business_name,
               sv.name as service_name, sv.price as service_price,
               st.name as staff_name
        FROM bookings bk
        JOIN slots s ON bk.slot_id = s.id
        JOIN businesses bs ON s.business_id = bs.id
        JOIN services sv ON s.service_id = sv.id
        LEFT JOIN staff st ON s.staff_id = st.id
        ORDER BY s.starts_at DESC
      `;
    }

    const result = await fastify.db.query(query, params);

    return {
      success: true,
      data: result.rows,
    };
  });

  fastify.post('/bookings', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['slot_id', 'customer_name'],
        properties: {
          slot_id: { type: 'integer' },
          customer_name: { type: 'string', minLength: 1 },
          customer_phone: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const { slot_id, customer_name, customer_phone, notes } = request.body;
    const customerId = request.user.role === 'customer' ? request.user.id : null;

    if (request.user.role === 'customer' && !customer_phone) {
      throw new ValidationError('Customer phone is required');
    }

    const slotResult = await fastify.db.query(
      'SELECT * FROM slots WHERE id = $1',
      [slot_id]
    );

    if (slotResult.rows.length === 0) {
      throw new NotFoundError('Slot');
    }

    const slot = slotResult.rows[0];

    if (slot.status !== 'available' && slot.status !== 'locked') {
      throw new ConflictError('Slot is not available for booking');
    }

    if (slot.booking_count >= slot.max_capacity) {
      throw new ConflictError('Slot is fully booked');
    }

    const bookingResult = await fastify.db.query(
      `INSERT INTO bookings (slot_id, customer_id, customer_phone, customer_name, status, notes, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
       RETURNING *`,
      [slot_id, customerId, customer_phone || request.user.phone, customer_name, notes]
    );

    const newBookingCount = slot.booking_count + 1;
    const newStatus = newBookingCount >= slot.max_capacity ? 'booked' : 'available';

    await fastify.db.query(
      'UPDATE slots SET booking_count = $1, status = $2 WHERE id = $3',
      [newBookingCount, newStatus, slot_id]
    );

    await unlockSlot(fastify.redis, slot_id, request.user.id.toString());

    return {
      success: true,
      data: {
        ...bookingResult.rows[0],
        slot,
      },
    };
  });

  fastify.put('/bookings/:id/confirm', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const result = await fastify.db.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Booking');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.put('/bookings/:id/cancel', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;

    const bookingResult = await fastify.db.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      throw new NotFoundError('Booking');
    }

    const booking = bookingResult.rows[0];

    if (request.user.role === 'customer' && booking.customer_id !== request.user.id) {
      throw new ForbiddenError();
    }

    await fastify.db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    await fastify.db.query(
      'UPDATE slots SET booking_count = GREATEST(booking_count - 1, 0), status = CASE WHEN booking_count - 1 < max_capacity THEN \'available\' ELSE status END WHERE id = $1',
      [booking.slot_id]
    );

    return {
      success: true,
      data: { id, status: 'cancelled' },
    };
  });

  fastify.put('/bookings/:id/no-show', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const result = await fastify.db.query(
      "UPDATE bookings SET status = 'no_show' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Booking');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });
}