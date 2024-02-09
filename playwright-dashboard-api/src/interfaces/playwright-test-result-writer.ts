export interface PlaywrightTestResultWriter {
    syncTestResults(): Promise<void>;
}
