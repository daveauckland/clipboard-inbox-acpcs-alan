import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.join(__dirname, '../../data.db');
export const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      title TEXT,
      url TEXT,
      tags TEXT DEFAULT '[]',
      state TEXT DEFAULT 'inbox',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
});

export interface ClipboardItemRow {
  id: number;
  content: string;
  title: string | null;
  url: string | null;
  tags: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function run(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
