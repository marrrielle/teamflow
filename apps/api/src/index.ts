import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './lib/env';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { projectsRouter } from './routes/projects';
import { tasksRouter } from './routes/tasks';
import { dashboardRouter } from './routes/dashboard';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'up' } });
});

app.use(authRouter);
app.use(usersRouter);
app.use(projectsRouter);
app.use(tasksRouter);
app.use(dashboardRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`api listening on :${env.PORT}`);
});
