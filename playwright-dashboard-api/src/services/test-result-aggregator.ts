import { AggregatedSpecResult, AggregatedSuiteResult, AggregatedTestResult } from '../interfaces/aggregated-suite-result';
import { JSONReportSpec, JSONReportSuite, JSONReportTest, JSONReportTestResult } from '../types/testReporter';
import { PlaywrightJSONReport } from '../interfaces/playwright-json-report';

/**
 * Aggregates test results from multiple Playwright JSON reports.
 * 
 * This function iterates over each report and each suite within the report, 
 * and aggregates the results using the `aggregateSuite` function. The results 
 * are stored in an object where the keys are the suite names and the values 
 * are the aggregated results for each suite.
 * 
 * @param {PlaywrightJSONReport[]} reports - An array of Playwright JSON reports to aggregate.
 * 
 * @returns {AggregatedSuiteResult[]} An array of aggregated suite results.
 */
export function aggregateTestResults(reports: PlaywrightJSONReport[]): AggregatedSuiteResult[] {
    // Create an object to store the aggregated suite results. The keys are suite file names.
    const aggregatedSuites: { [key: string]: AggregatedSuiteResult } = {};

    reports.forEach((report: PlaywrightJSONReport) => {
        report.result.suites.forEach((suite: JSONReportSuite) => {
            // Aggregate the test results for the suite and add them to the aggregated suites object
            aggregateSuite(report, suite, aggregatedSuites);
        });
    });

    // Convert the aggregated suites object to an array and return it
    return Object.values(aggregatedSuites);
}

/**
 * Aggregates the results of a suite from a Playwright JSON report.
 * 
 * This function aggregates the results of a suite, including its specs and tests, 
 * into an AggregatedSuiteResult object. If the suite contains nested suites, 
 * the function is called recursively to aggregate their results as well.
 * 
 * @param {PlaywrightJSONReport} report - The Playwright JSON report containing the suite.
 * @param {JSONReportSuite} suite - The suite to aggregate.
 * @param {{ [key: string]: AggregatedSuiteResult }} aggregatedSuites - An object to store the aggregated suite results.
 * @param {string[]} parentSuiteNames - An array of parent suite names. Defaults to an empty array.
 * 
 * @returns {void}
 */
function aggregateSuite(report: PlaywrightJSONReport, suite: JSONReportSuite, aggregatedSuites: { [key: string]: AggregatedSuiteResult }, parentSuiteNames: string[] = []): void {
    try {
        // Create an array of suite names by appending the current suite's title to the parent suite names
        const suiteNames: string[] = [...parentSuiteNames.slice(1), suite.title];

        // Use the suite file as the key for the aggregated suites object
        const suiteKey: string = suite.file;
    
        // If no aggregated suite exists for this key, create a new one and add it to the aggregated suites object
        if (!aggregatedSuites[suiteKey]) {
            aggregatedSuites[suiteKey] = {
                suiteTitle: suiteNames.join(' - '),
                suiteFile: suite.file,
                suiteRunStartTime: new Date(report.result.stats.startTime),
                specs: [],
                applicationName: report.applicationName
            };
        }
    
        // Get the aggregated suite for this key
        const aggregatedSuite: AggregatedSuiteResult = aggregatedSuites[suiteKey];
    
        // If the suite has specs, aggregate them
        if (suite.specs) {
            aggregateSpecs(report, suite, aggregatedSuite, suiteNames);
        }
    
        // If the suite has nested suites, recursively aggregate them
        if (suite.suites) {
            suite.suites.forEach((nestedSuite: JSONReportSuite) => {
                aggregateSuite(report, nestedSuite, aggregatedSuites, suiteNames);
            });
        }
    } catch (error) {
        // Log any errors that occur during the aggregation process
        console.error(`Error aggregating suite: ${error.message}`);
    }
}

/**
 * Aggregates the results of specs from a Playwright JSON report.
 * 
 * This function aggregates the results of specs, including their tests and results, 
 * into an AggregatedSpecResult object. The aggregated results are then added to the 
 * provided AggregatedSuiteResult object.
 * 
 * @param {PlaywrightJSONReport} report - The Playwright JSON report containing the suite.
 * @param {JSONReportSuite} suite - The suite containing the specs to aggregate.
 * @param {AggregatedSuiteResult} aggregatedSuite - The AggregatedSuiteResult object to add the aggregated specs to.
 * @param {string[]} suiteNames - An array of parent suite names.
 * 
 * @returns {void}
 */
function aggregateSpecs(report: PlaywrightJSONReport, suite: JSONReportSuite, aggregatedSuite: AggregatedSuiteResult, suiteNames: string[]): void {
    try {
         // Iterate over each spec in the suite
        suite.specs.forEach((spec: JSONReportSpec) => {
            // Create a title for the spec by concatenating the suite names with the spec name
            const specTitle: string = `${suiteNames.join(' - ')} > ${spec.title}`;

             // Try to find an existing aggregated spec with the same title
            let aggregatedSpec: AggregatedSpecResult = aggregatedSuite.specs.find((s: AggregatedSpecResult) => s.title === specTitle);

            // If no existing aggregated spec was found, create a new one and add it to the aggregated suite
            if (!aggregatedSpec) {
                aggregatedSpec = { title: specTitle, runs: [], file: spec.file, line: spec.line };
                aggregatedSuite.specs.push(aggregatedSpec);
            }

            // Map each test in the spec to an aggregated test result
            const aggregatedTestResults: AggregatedTestResult[] = spec.tests.map((test: JSONReportTest) => {
                return {
                    expectedStatus: test.expectedStatus,
                    status: test.status,
                    projectId: test.projectId,
                    projectName: test.projectName,
                    results: test.results.map((result: JSONReportTestResult) => ({
                        status: result.status,
                        startTime: result.startTime,
                    }))
                        // Sort the results by start time
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                };
            });

            // Add a new run to the aggregated spec with the aggregated test results
            aggregatedSpec.runs.push({
                ok: spec.ok,
                tests: aggregatedTestResults,
                specId: spec.id,
                suiteRunStartTime: new Date(report.result.stats.startTime),
                applicationName: report.applicationName,
                suiteFolderName: report.suiteFolderName,
                specResultFileUrl: process.env.BUCKET_BROWSER_CLIENT_URL_PREFIX + '/' + report.suiteFolderName + '/' + report.applicationName + '/index.html#?testId=' + spec.id
            });
        });
    } catch (error) {
        // Log any errors that occur during the aggregation process
        console.error(`Error aggregating specs: ${error.message}`);
    }
}
