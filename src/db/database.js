import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'database.sqlite');
export const db = new sqlite3.Database(dbPath);

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');

      db.run(
        `CREATE TABLE IF NOT EXISTS "Order" (
          orderId TEXT PRIMARY KEY,
          value INTEGER NOT NULL,
          creationDate TEXT NOT NULL
        )`,
        (err) => {
          if (err) return reject(err);
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS Items (
          orderId TEXT NOT NULL,
          productId INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price INTEGER NOT NULL,
          FOREIGN KEY(orderId) REFERENCES "Order"(orderId) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
}
