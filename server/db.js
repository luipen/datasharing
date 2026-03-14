const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'chores.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    recurrence TEXT NOT NULL DEFAULT 'none',
    recurrence_interval INTEGER DEFAULT 1,
    recurrence_days TEXT DEFAULT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS completions (
    id TEXT PRIMARY KEY,
    chore_id TEXT NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
    occurrence_date TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(chore_id, occurrence_date)
  );
`);

module.exports = db;
