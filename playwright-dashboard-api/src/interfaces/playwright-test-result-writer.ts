/**
 * Represents an interface for syncing for Playwright test results.
 * 
 * @method {Function} syncTestResults - A method that synchronizes test results. 
 * It does not accept any parameters and returns a Promise that resolves to void. 
 * The method is expected to handle the synchronization process, including any necessary error handling.
 */
export interface PlaywrightTestResultWriter {
    syncTestResults(): Promise<void>;
}
