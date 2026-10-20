import mysql from 'mysql2/promise';

const globalForMySQL = globalThis;

function createPool() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Database configuration missing: ${missing.join(', ')}. Check your .env.local file.`);
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

export const db = globalForMySQL.mysqlPool || createPool();
if (process.env.NODE_ENV !== 'production') globalForMySQL.mysqlPool = db;
