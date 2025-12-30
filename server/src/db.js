import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'data', 'vite-gourmand.db');
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'schema.sql');

function ensureDatabaseFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const db = new Database(DB_PATH);
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    db.close();
  }
}

ensureDatabaseFile();

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.function('to_json', (value) => JSON.stringify(value));

db.defaultSafeIntegers(true);

export function query(sql, params = []) {
  return db.prepare(sql).all(params);
}

export function queryOne(sql, params = []) {
  return db.prepare(sql).get(params);
}

export function run(sql, params = []) {
  return db.prepare(sql).run(params);
}

export function transaction(fn) {
  return db.transaction(fn);
}
