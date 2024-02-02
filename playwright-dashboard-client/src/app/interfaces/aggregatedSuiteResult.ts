import {
  JSONReport,
  JSONReportSpec,
  JSONReportTest,
  JSONReportTestResult,
} from '../types/testReporter';

export interface AggregatedSuiteResult {
  suiteTitle: string;
  suiteFile: string;
  specs: AggregatedSpecResult[];
  suiteRuns?: JSONReport[]; // Storing entire reports for suite-level stats
}

export interface AggregatedSpecResult extends Pick<JSONReportSpec, 'title' | 'file' | 'line'> {
  runs: AggregatedSpecRun[];
}

export interface AggregatedSpecRun extends Pick<JSONReportSpec, 'ok'> {
  specId: string; // Identifier for the test run
  suiteRunStartTime: string; // Start time of the test suite run
  tests: AggregatedTestResult[];
}

export interface AggregatedTestResult
  extends Pick<
    JSONReportTest,
    'expectedStatus' | 'status' | 'projectName' | 'projectId'
  > {
  results: PartialTestResult[];
}

export interface PartialTestResult
  extends Pick<
    JSONReportTestResult,
    'status' | 'startTime' | 'duration' | 'retry'
  > { }
