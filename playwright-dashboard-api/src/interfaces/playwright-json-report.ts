import { JSONReport } from '../types/testReporter';

export interface PlaywrightJSONReport {
    _id: string;
    applicationName: string;
    suiteFolderName: string;
    result: JSONReport;
}
