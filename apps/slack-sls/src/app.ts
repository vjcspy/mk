// import 'express-async-errors';

import type { Express } from 'express';
import express, { json, urlencoded } from 'express';

// import helmet from 'helmet';
import { healthCheckController } from '@/controller/health';
import { slackPostMessageController } from '@/controller/slack/post-message';
import { initializeSlack } from '@/service/slack';

const app: Express = express();

app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(helmet());

app.get('/', (_, res) => {
  res.json({
    msg: 'Serverless + Slack',
  });
});

app.get('/health', healthCheckController);
app.post('/slack/post-message', slackPostMessageController);

if (initializeSlack()) {
  app.use('/slack/events', initializeSlack()!.receiver.app);
}

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

export { app };
