import express from 'express';
import { getAllTestResults, getAllAggregatedTestResults, syncTestResults, getLatestAggregatedTestResults } from '../controllers/test-results.controller';

export const testResultsRouter = express.Router();

testResultsRouter.get('/', getAllTestResults);
testResultsRouter.get('/aggregated', getAllAggregatedTestResults);
testResultsRouter.get('/aggregated/latest', getLatestAggregatedTestResults);
testResultsRouter.post('/sync', syncTestResults);
