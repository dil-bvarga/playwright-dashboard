export interface PlaywrightTestResultWriter {
    saveTestResults(testResults: any[]): Promise<any[]>;
}