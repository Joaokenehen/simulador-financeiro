import { Request, Response } from 'express';
import * as LeaderboardService from '../services/leaderboardService.js';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const scores = await LeaderboardService.fetchLeaderboard();
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const postScore = async (req: Request, res: Response) => {
  try {
    const result = await LeaderboardService.addScore(req.body);
    res.status(201).json({ message: 'Pontuação salva com sucesso!', data: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};