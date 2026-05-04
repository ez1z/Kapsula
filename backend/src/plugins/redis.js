import fp from 'fastify-plugin';
import Redis from 'ioredis';

async function redisPlugin(fastify) {
  const redis = new Redis(fastify.config.redis.url, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
  });

  redis.on('error', (err) => {
    fastify.log.error('Redis error', err);
  });

  redis.on('connect', () => {
    fastify.log.info('Connected to Redis');
  });

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
  });
}

export default fp(redisPlugin, {
  name: 'redis',
  config: { redis: true },
});