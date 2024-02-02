import { JSONReport } from "../types/testReporter";

export interface PlaywrightTestResultReader {
    getTestResults(testSuiteRunCount?: number): Promise<JSONReport[]>;
}