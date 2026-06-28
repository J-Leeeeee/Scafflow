// Starts local Redis + embedded Postgres for development (no Docker required).
// Run: npm run infra

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import EmbeddedPostgres from 'embedded-postgres';

const ROOT = path.resolve(__dirname, '..');
const PG_DIR = path.join(ROOT, '.local', 'pgdata');
const REDIS_DIR = path.join(os.homedir(), '.local', 'redis-data');
const REDIS_SERVER = path.join(os.homedir(), '.local', 'redis', 'bin', 'redis-server');

async function startRedis(): Promise<void> {
  if (!fs.existsSync(REDIS_SERVER)) {
    throw new Error(`Redis not found at ${REDIS_SERVER}. Compile or install Redis first.`);
  }
  fs.mkdirSync(REDIS_DIR, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const child = spawn(REDIS_SERVER, [
      '--port', '6379',
      '--dir', REDIS_DIR,
      '--daemonize', 'yes',
    ], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`redis-server exited ${code}`))));
  });
  console.log('Redis running on redis://127.0.0.1:6379');
}

async function startPostgres(): Promise<EmbeddedPostgres> {
  const pg = new EmbeddedPostgres({
    databaseDir: PG_DIR,
    user: 'scaffold',
    password: 'scaffold',
    port: 5432,
    persistent: true,
  });

  const hasCluster = fs.existsSync(path.join(PG_DIR, 'PG_VERSION'));
  if (!hasCluster) {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase('scaffold');
  } catch {
    // Database already exists from a previous run.
  }
  console.log('Postgres running on postgresql://scaffold:scaffold@127.0.0.1:5432/scaffold');
  return pg;
}

async function main(): Promise<void> {
  await startRedis();
  const pg = await startPostgres();

  const shutdown = async () => {
    console.log('\nStopping local infra...');
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('Local infra ready. Press Ctrl+C to stop.');
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
