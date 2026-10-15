require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'taskflow.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

const init = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
        due_date TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.get('SELECT COUNT(*) AS total FROM tasks', (err, row) => {
      if (err) return;
      if (row && Number(row.total) === 0) {
        db.run(`
          INSERT INTO tasks (title, description, status, priority, due_date, created_at, updated_at) VALUES
          ('Finish DBMS assignment', 'Normalization and ER diagrams', 'in_progress', 'high', '2026-11-01', datetime('now'), datetime('now')),
          ('Revise DSA: graphs', 'BFS, DFS, Dijkstra', 'todo', 'medium', '2026-11-05', datetime('now'), datetime('now')),
          ('Push project to GitHub', NULL, 'done', 'low', NULL, datetime('now'), datetime('now'))
        `);
      }
    });
  });
};

init();

module.exports = { db, run, get, all };
