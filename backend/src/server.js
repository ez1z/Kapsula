import { config } from './config/index.js';
import { buildApp } from './app.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({
      port: config.app.port,
      host: config.app.host,
    });
    app.log.info(`Server running at http://${config.app.host}:${config.app.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();