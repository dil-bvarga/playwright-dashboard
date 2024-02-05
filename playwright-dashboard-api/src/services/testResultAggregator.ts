import { AggregatedSuiteResult } from "../interfaces/aggregatedSuiteResult";
import { JSONReport } from "../types/testReporter";

export function aggregateTestResults(reports: JSONReport[]): AggregatedSuiteResult[] {
    const aggregatedSuites: { [key: string]: AggregatedSuiteResult } = {};

    reports.forEach(report => {
        report.suites.forEach(suite => {
            const suiteKey = `${suite.title}-${suite.file}`;
            if (!aggregatedSuites[suiteKey]) {
                aggregatedSuites[suiteKey] = { suiteTitle: suite.title, suiteFile: suite.file, specs: [], suiteRuns: [] };
            }

            const aggregatedSuite = aggregatedSuites[suiteKey];

            suite.specs.forEach(spec => {
                let aggregatedSpec = aggregatedSuite.specs.find(s => s.title === spec.title);
                if (!aggregatedSpec) {
                    aggregatedSpec = { title: spec.title, runs: [], file: spec.file, line: spec.line };
                    aggregatedSuite.specs.push(aggregatedSpec);
                }

                const aggregatedTestResults = spec.tests.map(test => {
                    return {
                        expectedStatus: test.expectedStatus,
                        status: test.status,
                        projectId: test.projectId,
                        projectName: test.projectName,
                        results: test.results.map(result => ({
                            status: result.status,
                            startTime: result.startTime,
                            error: result.error,
                            duration: result.duration,
                            retry: result.retry
                        }))
                    };
                });

                aggregatedSpec.runs.push({
                    ok: spec.ok,
                    tests: aggregatedTestResults,
                    specId: spec.id, // or some other unique identifier from the report
                    suiteRunStartTime: report.stats.startTime
                });
            });
        });
    });

    return Object.values(aggregatedSuites);
}