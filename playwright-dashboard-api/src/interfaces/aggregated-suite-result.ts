import { JSONReportSpec, JSONReportTest, JSONReportTestResult } from '../types/testReporter';

/**
 * Represents the aggregated result of a test suite.
 * 
 * @property {string} suiteTitle - The title of the test suite.
 * @property {string} suiteFile - The file where the test suite is located.
 * @property {Date} suiteRunStartTime - The start time of the test suite run.
 * @property {string} applicationName - The name of the application under test.
 * @property {AggregatedSpecResult[]} specs - An array of aggregated results for each spec in the suite.
 */
export interface AggregatedSuiteResult {
    suiteTitle: string;
    suiteFile: string;
    suiteRunStartTime: Date;
    applicationName: string;
    specs: AggregatedSpecResult[];
}

/**
 * Represents the aggregated result of a spec.
 * 
 * This interface extends `JSONReportSpec`, picking the 'title', 'file', and 'line' properties.
 * 
 * @property {AggregatedSpecRun[]} runs - An array of aggregated results for each run of the spec.
 */
export interface AggregatedSpecResult extends Pick<JSONReportSpec, | 'title' | 'file' | 'line'> {
    runs: AggregatedSpecRun[];
}

/**
 * Represents the aggregated result of a spec run.
 * 
 * This interface extends `JSONReportSpec`, picking the 'ok' property.
 * 
 * @property {string} specId - The identifier for the test.
 * @property {Date} suiteRunStartTime - The start time of the test suite run.
 * @property {AggregatedTestResult[]} tests - An array of aggregated results for each test in the spec run.
 * @property {string} applicationName - The name of the application under test.
 * @property {string} suiteFolderName - The name of the folder containing the test suite.
 * @property {string} specResultFileUrl - The URL of the file containing the spec result.
 */
export interface AggregatedSpecRun extends Pick<JSONReportSpec, | 'ok'> {
    specId: string;
    suiteRunStartTime: Date;
    tests: AggregatedTestResult[];
    applicationName: string;
    suiteFolderName: string;
    specResultFileUrl: string;
}

/**
 * Represents the aggregated result of a test.
 * 
 * This interface extends `JSONReportTest`, picking the 'expectedStatus', 'status', 'projectName', and 'projectId' properties.
 * 
 * @property {PartialTestResult[]} results - An array of partial results for the test.
 */
export interface AggregatedTestResult extends Pick<JSONReportTest, | 'expectedStatus' | 'status' | 'projectName' | 'projectId'> {
    results: PartialTestResult[];
}

/**
 * Represents a partial result of a test.
 * 
 * This interface extends `JSONReportTestResult`, picking the 'status' and 'startTime' properties.
 * 
 * @property {string} status - The status of the test.
 * @property {Date} startTime - The start time of the test.
 */
export interface PartialTestResult extends Pick<JSONReportTestResult, | 'status' | 'startTime'> {
}
