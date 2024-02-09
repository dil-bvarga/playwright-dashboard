import { PlaywrightJSONReport } from './playwright-json-report';

export interface PlaywrightTestResultReader {
    getTestResults(from?: Date): Promise<PlaywrightJSONReport[]>;
}
