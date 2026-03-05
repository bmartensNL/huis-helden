import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { tasksRouter } from './routes/tasks';
import { childrenRouter } from './routes/children';
import { rewardsRouter } from './routes/rewards';
import { leaderboardRouter } from './routes/leaderboard';
import { badgesRouter } from './routes/badges';
import { weekOverviewRouter } from './routes/week-overview';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/children', childrenRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/week-overview', weekOverviewRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'HuisHelden API' });
});

app.listen(PORT, () => {
  console.log(`🦸 HuisHelden API running on port ${PORT}`);
});

export default app;
