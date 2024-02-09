import { PlaywrightJSONReport } from './playwright-json-report';

/**
 * Represents an interface for getting Playwright test results.
 * 
 * @method {Function} getTestResults - A method that retrieves test results. 
 * It accepts an optional Date parameter 'from', which specifies the start date for retrieving test results. 
 * If 'from' is provided, only test results that started on or after this date are retrieved. 
 * If 'from' is not provided, all test results are retrieved. 
 * The method returns a Promise that resolves to an array of PlaywrightJSONReport objects.
 */
export interface PlaywrightTestResultReader {
    getTestResults(from?: Date): Promise<PlaywrightJSONReport[]>;
}
