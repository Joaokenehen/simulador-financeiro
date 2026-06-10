import * as LeaderboardModel from '../models/leaderboardModel.js';

export const fetchLeaderboard = async () => {
  return await LeaderboardModel.getTopScores();
};

export const addScore = async (data: LeaderboardModel.ScoreData) => {
  if (!data.playerName || data.finalScore === undefined) {
    throw new Error('Dados incompletos para salvar a pontuação.');
  }
  return await LeaderboardModel.saveScore(data);
};
