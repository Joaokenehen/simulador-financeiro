import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import './database/db.js'; // Inicia a conexão com o SQLite

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Simulador Financeiro rodando perfeitamente!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});