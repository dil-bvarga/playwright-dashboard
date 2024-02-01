import express from "express";
import { getAllAggregatedTestResults, getAllTestResults, postTestResults } from "./testResults.controller";

export const testResultsRouter = express.Router();

testResultsRouter.get('/', getAllTestResults);
testResultsRouter.get('/aggregated', getAllAggregatedTestResults);
testResultsRouter.post('/', postTestResults);