import pg from 'pg';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Running seed data...');

    const seedFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'seeds', '001_seed.sql');
    const sql = readFileSync(seedFile, 'utf-8');

    await pool.query(sql);

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();