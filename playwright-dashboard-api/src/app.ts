import cors from 'cors';
import express, { Express } from 'express';
import { testResultsRouter } from './routes/test-results.router';

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/test-results', testResultsRouter);
