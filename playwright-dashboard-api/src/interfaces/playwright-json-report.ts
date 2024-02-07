import { JSONReport } from "../types/testReporter";

export interface PlaywrightJSONReport extends JSONReport {
    _id: string;
    project: string;
}