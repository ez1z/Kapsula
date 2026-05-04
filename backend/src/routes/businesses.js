import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

export default async function businessesRoutes(fastify) {
  fastify.get('/businesses', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['barber', 'cafe', 'salon'] },
          active: { type: 'boolean', default: true },
        },
      },
    },
  }, async (request) => {
    const { type, active = true } = request.query;

    let query = `
      SELECT b.*,
        COALESCE(json_agg(DISTINCT bh.jsonb) FILTER (WHERE bh.id IS NOT NULL), '[]') as hours
       FROM businesses b
       LEFT JOIN business_hours bh ON b.id = bh.business_id
       WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND b.type = $${params.length}`;
    }

    if (active !== undefined) {
      params.push(active);
      query += ` AND b.is_active = $${params.length}`;
    }

    query += ' GROUP BY b.id ORDER BY b.name';

    const result = await fastify.db.query(query, params);

    return {
      success: true,
      data: result.rows.map((row) => ({
        ...row,
        hours: row.hours[0] === null ? [] : row.hours,
      })),
    };
  });

  fastify.get('/businesses/:id', async (request) => {
    const { id } = request.params;

    const result = await fastify.db.query(
      `SELECT b.*,
        COALESCE(json_agg(DISTINCT bh.jsonb) FILTER (WHERE bh.id IS NOT NULL), '[]') as hours
       FROM businesses b
       LEFT JOIN business_hours bh ON b.id = bh.business_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Business');
    }

    const business = result.rows[0];

    const [services, staff] = await Promise.all([
      fastify.db.query(
        'SELECT * FROM services WHERE business_id = $1 AND is_active = true ORDER BY name',
        [id]
      ),
      fastify.db.query(
        'SELECT * FROM staff WHERE business_id = $1 AND is_active = true ORDER BY name',
        [id]
      ),
    ]);

    return {
      success: true,
      data: {
        ...business,
        hours: business.hours[0] === null ? [] : business.hours,
        services: services.rows,
        staff: staff.rows,
      },
    };
  });

  fastify.post('/businesses', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'phone', 'address'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['barber', 'cafe', 'salon'] },
          phone: { type: 'string' },
          address: { type: 'string' },
          timezone: { type: 'string', default: 'Asia/Ashgabat' },
        },
      },
    },
  }, async (request) => {
    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const { name, type, phone, address, timezone } = request.body;

    const result = await fastify.db.query(
      `INSERT INTO businesses (name, type, phone, address, timezone, owner_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING *`,
      [name, type, phone, address, timezone || 'Asia/Ashgabat', request.user.id]
    );

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.put('/businesses/:id', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;
    const updates = request.body;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const allowedFields = ['name', 'phone', 'address', 'timezone'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    values.push(id);
    const result = await fastify.db.query(
      `UPDATE businesses SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Business');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.put('/businesses/:id/hours', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;
    const { hours } = request.body;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    await fastify.db.query('DELETE FROM business_hours WHERE business_id = $1', [id]);

    if (hours && hours.length > 0) {
      for (const hour of hours) {
        await fastify.db.query(
          `INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_day_off)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, hour.day_of_week, hour.open_time, hour.close_time, hour.is_day_off || false]
        );
      }
    }

    const result = await fastify.db.query(
      'SELECT * FROM business_hours WHERE business_id = $1 ORDER BY day_of_week',
      [id]
    );

    return {
      success: true,
      data: result.rows,
    };
  });
}