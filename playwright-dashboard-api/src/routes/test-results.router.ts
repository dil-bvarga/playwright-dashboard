import express from 'express';
import { getAllTestResults, getAllAggregatedTestResults, syncTestResults } from '../controllers/test-results.controller';

export const testResultsRouter = express.Router();

testResultsRouter.get('/', getAllTestResults);
testResultsRouter.get('/aggregated', getAllAggregatedTestResults);
testResultsRouter.post('/sync', syncTestResults);
