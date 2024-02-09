import { JSONReport } from '../types/testReporter';

/**
 * Represents a Playwright JSON report.
 * 
 * @property {string} _id - The unique identifier for the report.
 * @property {string} applicationName - The name of the application under test.
 * @property {string} suiteFolderName - The name of the folder containing the test suite.
 * @property {JSONReport} result - The result of the report in JSON format.
 */
export interface PlaywrightJSONReport {
    _id: string;
    applicationName: string;
    suiteFolderName: string;
    result: JSONReport;
}
