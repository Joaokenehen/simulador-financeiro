import db from '../database/db.js';

export interface ScoreData {
  playerName: string;
  finalScore: number;
  saldo: number;
  month: number;
  cause?: string;
}

export const getTopScores = async (): Promise<any[]> => {
  const stmt = db.prepare('SELECT * FROM leaderboard ORDER BY finalScore DESC, saldo DESC LIMIT 10');
  return stmt.all();
};

export const saveScore = async (data: ScoreData): Promise<any> => {
  const stmt = db.prepare('INSERT INTO leaderboard (playerName, finalScore, saldo, month, cause) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(data.playerName, data.finalScore, data.saldo, data.month, data.cause || null);
  return { id: result.lastInsertRowid, ...data };
};