import fs from 'fs';
import path from 'path';
import { PlaywrightTestResultReader } from "../interfaces/playwrightTestResultReader";
import { PlaywrightTestResultWriter } from "../interfaces/playwrightTestResultWriter";
import { JSONReport } from "../types/testReporter";
import { JSONReportModel } from '../interfaces/json-report.mongo';
import { AggregatedSuiteResult } from '../interfaces/aggregatedSuiteResult';
import { aggregateTestResults } from './testResultAggregator';

export class PlaywrightTestResultMongoService implements PlaywrightTestResultReader, PlaywrightTestResultWriter {
    public async saveTestResults(testResults: JSONReport[]): Promise<JSONReport[]> {
        const newSourceTestFolders = fs.readdirSync('./test_result_source', { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of newSourceTestFolders) {
            const sourceFilePath = path.join('./test_result_source', folder, 'results.json');

            if (!fs.existsSync(sourceFilePath)) {
                throw new Error('Source file does not exist');
            }

            const testResultData: JSONReport = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));
            try {
                // Save the test result to the database
                await JSONReportModel.create(testResultData);
            } catch (error) {
                console.error(error);
                throw new Error('Error saving test result');
            }
        }

        return testResults;
    }

    public async getTestResults(testSuiteRunCount?: number): Promise<JSONReport[]> {
        return await JSONReportModel.find({}, { '__id': 0 }).sort({ 'stats.startTime': -1 }).limit(testSuiteRunCount ?? 10);
    }

    public async getAggregatedTestResults(testSuiteRunCount?: number): Promise<AggregatedSuiteResult[]> {
        const testResults: JSONReport[] = await this.getTestResults(testSuiteRunCount);
        return aggregateTestResults(testResults);
    }
}