import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { lockSlot, unlockSlot, getSlotLockHolder } from '../services/slot-locker.js';

export default async function slotsRoutes(fastify) {
  fastify.get('/businesses/:businessId/slots', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          staff_id: { type: 'integer' },
          service_id: { type: 'integer' },
        },
      },
    },
  }, async (request) => {
    const { businessId } = request.params;
    const { date, staff_id, service_id } = request.query;

    let query = `
      SELECT s.*,
             st.name as staff_name, st.color as staff_color,
             sv.name as service_name, sv.duration_minutes, sv.price, sv.service_type
      FROM slots s
      LEFT JOIN staff st ON s.staff_id = st.id
      LEFT JOIN services sv ON s.service_id = sv.id
      WHERE s.business_id = $1 AND s.status = 'available' AND s.booking_count < s.max_capacity
    `;
    const params = [businessId];
    let paramIndex = 2;

    if (date) {
      params.push(date);
      query += ` AND DATE(s.starts_at) = $${paramIndex}`;
      paramIndex++;
    }

    if (staff_id) {
      params.push(staff_id);
      query += ` AND s.staff_id = $${paramIndex}`;
      paramIndex++;
    }

    if (service_id) {
      params.push(service_id);
      query += ` AND s.service_id = $${paramIndex}`;
      paramIndex++;
    }

    query += ' ORDER BY s.starts_at';

    const result = await fastify.db.query(query, params);

    return {
      success: true,
      data: result.rows,
    };
  });

  fastify.post('/businesses/:businessId/slots/generate', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['date', 'start_time', 'end_time', 'interval_minutes'],
        properties: {
          date: { type: 'string', format: 'date' },
          start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
          interval_minutes: { type: 'integer', minimum: 5, maximum: 480 },
          staff_ids: { type: 'array', items: { type: 'integer' } },
          service_ids: { type: 'array', items: { type: 'integer' } },
        },
      },
    },
  }, async (request) => {
    const { businessId } = request.params;
    const { date, start_time, end_time, interval_minutes, staff_ids, service_ids } = request.body;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    let staffQuery = 'SELECT id FROM staff WHERE business_id = $1 AND is_active = true';
    let serviceQuery = 'SELECT id, duration_minutes FROM services WHERE business_id = $1 AND is_active = true';

    const staffResult = staff_ids?.length
      ? await fastify.db.query(`${staffQuery} AND id = ANY($2)`, [businessId, staff_ids])
      : await fastify.db.query(staffQuery, [businessId]);

    const serviceResult = service_ids?.length
      ? await fastify.db.query(`${serviceQuery} AND id = ANY($2)`, [businessId, service_ids])
      : await fastify.db.query(serviceQuery, [businessId]);

    const slots = [];
    const start = new Date(`${date}T${start_time}:00`);
    const end = new Date(`${date}T${end_time}:00`);

    for (const staff of staffResult.rows) {
      for (const service of serviceResult.rows) {
        let slotStart = new Date(start);

        while (slotStart < end) {
          const slotEnd = new Date(slotStart.getTime() + service.duration_minutes * 60000);

          if (slotEnd > end) break;

          const result = await fastify.db.query(
            `INSERT INTO slots (business_id, staff_id, service_id, starts_at, ends_at, status, max_capacity, booking_count)
             VALUES ($1, $2, $3, $4, $5, 'available', 1, 0)
             RETURNING *`,
            [businessId, staff.id, service.id, slotStart.toISOString(), slotEnd.toISOString()]
          );

          slots.push(result.rows[0]);
          slotStart = new Date(slotEnd.getTime());
        }
      }
    }

    return {
      success: true,
      data: {
        generated: slots.length,
        slots,
      },
    };
  });

  fastify.post('/slots/:id/lock', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;
    const sessionId = request.user.id.toString();

    const slotResult = await fastify.db.query(
      'SELECT * FROM slots WHERE id = $1',
      [id]
    );

    if (slotResult.rows.length === 0) {
      throw new NotFoundError('Slot');
    }

    const slot = slotResult.rows[0];

    if (slot.status !== 'available') {
      throw new ConflictError('Slot is not available');
    }

    const locked = await lockSlot(fastify.redis, id, sessionId);

    if (!locked) {
      const holder = await getSlotLockHolder(fastify.redis, id);
      throw new ConflictError(`Slot is locked by another user${holder === sessionId ? ' (your session)' : ''}`);
    }

    await fastify.db.query(
      "UPDATE slots SET status = 'locked' WHERE id = $1",
      [id]
    );

    return {
      success: true,
      data: { locked: true, expires_in: 300 },
    };
  });

  fastify.post('/slots/:id/unlock', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;
    const sessionId = request.user.id.toString();

    const unlocked = await unlockSlot(fastify.redis, id, sessionId);

    if (unlocked) {
      await fastify.db.query(
        "UPDATE slots SET status = 'available' WHERE id = $1 AND status = 'locked'",
        [id]
      );
    }

    return {
      success: true,
      data: { unlocked },
    };
  });
}