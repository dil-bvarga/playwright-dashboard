import { JSONReportSpec, JSONReportTest, JSONReportTestResult } from '../types/testReporter';

export interface AggregatedSuiteResult {
    suiteTitle: string;
    suiteFile: string;
    suiteRunStartTime: Date; // Start time of the test suite run
    applicationName: string;
    specs: AggregatedSpecResult[];
}

interface AggregatedSpecResult extends Pick<JSONReportSpec, | 'title' | 'file' | 'line'> {
    runs: AggregatedSpecRun[];
}

interface AggregatedSpecRun extends Pick<JSONReportSpec, | 'ok'> {
    specId: string; // Identifier for the test
    suiteRunStartTime: Date; // Start time of the test suite run
    tests: AggregatedTestResult[];
    applicationName: string;
    suiteFolderName: string;
    specResultFileUrl: string;
}

interface AggregatedTestResult extends Pick<JSONReportTest, | 'expectedStatus' | 'status' | 'projectName' | 'projectId'> {
    results: PartialTestResult[];
}

interface PartialTestResult extends Pick<JSONReportTestResult, | 'status' | 'startTime'> {
}
