import express, { Express } from "express";
import cors from "cors";
import { testResultsRouter } from "./routes/test-results/testResults.router";

export const app: Express = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

app.use('/test-results', testResultsRouter);
