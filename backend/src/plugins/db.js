import fp from 'fastify-plugin';
import pg from 'pg';

const { Pool } = pg;

async function dbPlugin(fastify) {
  const pool = new Pool({
    connectionString: fastify.config.database.url,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    fastify.log.error('Unexpected PostgreSQL error', err);
  });

  fastify.decorate('db', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fp(dbPlugin, {
  name: 'db',
  config: { database: true },
});