import { AggregatedSuiteResult } from "../../interfaces/aggregatedSuiteResult";
import { PlaywrightTestResultLocalDirectoryService } from "../../services/playwrightTestResultLocalDirectoryService";
import { JSONReport } from "../../types/testReporter";

const playwrightTestResultService = new PlaywrightTestResultLocalDirectoryService('./test_result_source', './test_result_destination');

export async function getAllTestResults(req, res) {
    try {
        const testResults: JSONReport[] = await playwrightTestResultService.getTestResults();
        res.status(200).json(testResults);
    } catch (error) {
        res.status(500).json({ message: 'Error reading test results' });
    }
}

export async function getAllAggregatedTestResults(req, res) {
    try {
        const testResults: AggregatedSuiteResult[] = await playwrightTestResultService.getAggregatedTestResults();
        res.status(200).json(testResults);
    } catch (error) {
        res.status(500).json({ message: 'Error reading test results' });
    }
}

export async function postTestResults(req, res) {
    try {
        const testResults: JSONReport[] = await playwrightTestResultService.saveTestResults(req.body.testResults);
        res.status(200).json(testResults);
    } catch (error) {
        res.status(500).json({ message: 'Error reading test results' });
    }
}