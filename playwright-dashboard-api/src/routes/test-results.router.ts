import express from 'express';
import { getAllAggregatedTestResults, syncTestResults, getLatestAggregatedTestResults } from '../controllers/test-results.controller';

export const testResultsRouter = express.Router();

testResultsRouter.get('/aggregated', getAllAggregatedTestResults);
testResultsRouter.get('/aggregated/latest', getLatestAggregatedTestResults);
testResultsRouter.post('/sync', syncTestResults);
