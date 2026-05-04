import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export default async function adminRoutes(fastify) {
  fastify.get('/admin/businesses', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    if (request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const result = await fastify.db.query(
      'SELECT * FROM businesses ORDER BY created_at DESC'
    );

    return {
      success: true,
      data: result.rows,
    };
  });

  fastify.put('/admin/businesses/:id/activate', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    if (request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const { id } = request.params;

    const result = await fastify.db.query(
      'UPDATE businesses SET is_active = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Business');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.put('/admin/businesses/:id/deactivate', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    if (request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const { id } = request.params;

    const result = await fastify.db.query(
      'UPDATE businesses SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Business');
    }

    return {
      success: true,
      data: result.rows[0],
    };
  });

  fastify.get('/admin/stats', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    if (request.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const [businessCount, userCount, bookingCount] = await Promise.all([
      fastify.db.query('SELECT COUNT(*) as count FROM businesses'),
      fastify.db.query('SELECT COUNT(*) as count FROM users'),
      fastify.db.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"),
    ]);

    return {
      success: true,
      data: {
        businesses: parseInt(businessCount.rows[0].count),
        users: parseInt(userCount.rows[0].count),
        bookings: parseInt(bookingCount.rows[0].count),
      },
    };
  });
}