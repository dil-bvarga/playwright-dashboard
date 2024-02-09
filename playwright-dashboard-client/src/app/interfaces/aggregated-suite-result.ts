import {
  JSONReportSpec,
  JSONReportTest,
  JSONReportTestResult,
} from '../types/testReporter';

export interface AggregatedSuiteResult {
  suiteTitle: string;
  suiteFile: string;
  applicationName: string;
  suiteRunStartTime: Date; // Start time of the test suite run
  specs: AggregatedSpecResult[];
}

export interface AggregatedSpecResult
  extends Pick<JSONReportSpec, 'title' | 'file' | 'line'> {
  runs: AggregatedSpecRun[];
}

export interface AggregatedSpecRun extends Pick<JSONReportSpec, 'ok'> {
  specId: string; // Identifier for the test run
  suiteRunStartTime: Date; // Start time of the test suite run
  tests: AggregatedTestResult[];
  applicationName: string;
  suiteFolderName: string;
  specResultFileUrl: string;
}

export interface AggregatedTestResult
  extends Pick<
    JSONReportTest,
    'expectedStatus' | 'status' | 'projectName' | 'projectId'
  > {
  results: PartialTestResult[];
}

export interface PartialTestResult
  extends Pick<JSONReportTestResult, 'status' | 'startTime'> {}
