import express, { Express } from 'express';
import cors from 'cors';
import { testResultsRouter } from './routes/test-results.router';

export const app: Express = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
}));
app.use(express.json());

app.use('/test-results', testResultsRouter);
