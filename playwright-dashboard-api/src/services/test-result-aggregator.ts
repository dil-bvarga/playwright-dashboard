import { AggregatedSuiteResult } from '../interfaces/aggregated-suite-result';
import { PlaywrightJSONReport } from '../interfaces/playwright-json-report';
import { JSONReportSuite, JSONReportTest, JSONReportTestResult } from '../types/testReporter';

export function aggregateTestResults(reports: PlaywrightJSONReport[]): AggregatedSuiteResult[] {
    const aggregatedSuites: { [key: string]: AggregatedSuiteResult } = {};

    reports.forEach((report: PlaywrightJSONReport) => {
        report.result.suites.forEach((suite: JSONReportSuite) => {
            aggregateSuite(report, suite, aggregatedSuites);
        });
    });

    return Object.values(aggregatedSuites);
}

function aggregateSuite(report: PlaywrightJSONReport, suite: JSONReportSuite, aggregatedSuites: { [key: string]: AggregatedSuiteResult }, parentSuiteNames: string[] = []): void {
    const suiteNames = [...parentSuiteNames.slice(1), suite.title];
    const suiteKey = suite.file; // use the suite file as the key

    if (!aggregatedSuites[suiteKey]) {
        aggregatedSuites[suiteKey] = {
            suiteTitle: suiteNames.join(' - '),
            suiteFile: suite.file,
            suiteRunStartTime: new Date(report.result.stats.startTime),
            specs: [],
            applicationName: report.applicationName
        };
    }

    const aggregatedSuite = aggregatedSuites[suiteKey];

    suite.specs.forEach(spec => {
        const specTitle = `${suiteNames.join(' - ')} > ${spec.title}`; // concatenate the suite names with the spec name
        let aggregatedSpec = aggregatedSuite.specs.find(s => s.title === specTitle);
        if (!aggregatedSpec) {
            aggregatedSpec = { title: specTitle, runs: [], file: spec.file, line: spec.line };
            aggregatedSuite.specs.push(aggregatedSpec);
        }

        const aggregatedTestResults = spec.tests.map((test: JSONReportTest) => {
            return {
                expectedStatus: test.expectedStatus,
                status: test.status,
                projectId: test.projectId,
                projectName: test.projectName,
                results: test.results.map((result: JSONReportTestResult) => ({
                    status: result.status,
                    startTime: result.startTime,
                    error: result.error,
                    duration: result.duration,
                    retry: result.retry
                }))
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            };
        });

        aggregatedSpec.runs.push({
            ok: spec.ok,
            tests: aggregatedTestResults,
            specId: spec.id, // or some other unique identifier from the report
            suiteRunStartTime: new Date(report.result.stats.startTime),
            applicationName: report.applicationName,
            suiteFolderName: report.suiteFolderName,
            specResultFileUrl: process.env.BUCKET_BROWSER_CLIENT_URL_PREFIX + '/' + report.suiteFolderName + '/' + report.applicationName + '/index.html#?testId=' + spec.id
        });
    });

    if (suite.suites?.length > 0) {
        // If there are no specs but there are nested suites, recursively aggregate them
        suite.suites.forEach(nestedSuite => {
            aggregateSuite(report, nestedSuite, aggregatedSuites, suiteNames);
        });
    }
}
