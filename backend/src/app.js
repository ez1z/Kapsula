import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config/index.js';
import { errorHandler } from './utils/errors.js';
import dbPlugin from './plugins/db.js';
import redisPlugin from './plugins/redis.js';
import authRoutes from './routes/auth.js';
import businessesRoutes from './routes/businesses.js';
import servicesRoutes from './routes/services.js';
import slotsRoutes from './routes/slots.js';
import bookingsRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';

export async function buildApp(opts = {}) {
  const fastify = Fastify({
    logger: {
      level: config.app.env === 'development' ? 'info' : 'warn',
    },
    ...opts,
  });

  fastify.setErrorHandler(errorHandler);

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: config.jwt.secret,
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
  });

  await fastify.register(dbPlugin);
  await fastify.register(redisPlugin);

  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(businessesRoutes, { prefix: '/api' });
  await fastify.register(servicesRoutes, { prefix: '/api' });
  await fastify.register(slotsRoutes, { prefix: '/api' });
  await fastify.register(bookingsRoutes, { prefix: '/api' });
  await fastify.register(adminRoutes, { prefix: '/api' });

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return fastify;
}