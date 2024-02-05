import { JSONReport } from "../types/testReporter";

export interface PlaywrightTestResultWriter {
    saveTestResults(testResults: JSONReport[]): Promise<JSONReport[]>;
}