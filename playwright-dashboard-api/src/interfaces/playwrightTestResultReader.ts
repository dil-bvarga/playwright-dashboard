export interface PlaywrightTestResultReader {
    getTestResults(): Promise<any[]>;
}