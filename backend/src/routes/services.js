import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

export default async function servicesRoutes(fastify) {
  fastify.get('/businesses/:businessId/services', async (request) => {
    const { businessId } = request.params;

    const result = await fastify.db.query(
      'SELECT * FROM services WHERE business_id = $1 AND is_active = true ORDER BY name',
      [businessId]
    );

    return {
      success: true,
      data: result.rows,
    };
  });

  fastify.post('/businesses/:businessId/services', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { businessId } = request.params;
    const { name, duration_minutes, price, service_type, max_capacity = 1 } = request.body;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const result = await fastify.db.query(
      `INSERT INTO services (business_id, name, duration_minutes, price, service_type, max_capacity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [businessId, name, duration_minutes, price, service_type || 'standard', max_capacity]
    );

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.put('/services/:id', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;
    const updates = request.body;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const allowedFields = ['name', 'duration_minutes', 'price', 'service_type', 'max_capacity', 'is_active'];
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
      `UPDATE services SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Service');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.delete('/services/:id', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params;

    if (request.user.role !== 'business' && request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const result = await fastify.db.query(
      'UPDATE services SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Service');
    }

    return {
      success: true,
      data: { id: result.rows[0].id },
    };
  });
}