import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerName TEXT NOT NULL,
    finalScore INTEGER NOT NULL,
    saldo REAL NOT NULL,
    month INTEGER NOT NULL,
    cause TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Conectado ao banco de dados nativo do Node.js (node:sqlite).');

export default db;