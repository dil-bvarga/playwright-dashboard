import { PlaywrightTestResultReader } from '../interfaces/playwright-test-result-reader';
import { PlaywrightTestResultWriter } from '../interfaces/playwright-test-result-writer';
import { PlaywrightJSONReportModel } from '../models/playwright-json-report-model.mongo';
import { AggregatedSuiteResult } from '../interfaces/aggregated-suite-result';
import { aggregateTestResults } from './test-result-aggregator';
import { getBucketBrowserTestRunFolderNames, getBucketBrowserTestRunResultFileNames, getBucketBrowserTestSuiteRunResults } from './playwright-test-result-bucket-browser-service';
import { PlaywrightJSONReport } from '../interfaces/playwright-json-report';

/**
 * PlaywrightTestResultMongoService is responsible for synchronizing test results from a bucket with a MongoDB database and get the data from the database in simple and aggregated format.
 */
export class PlaywrightTestResultMongoService implements PlaywrightTestResultReader, PlaywrightTestResultWriter {

    /**
     * Synchronizes test results from a bucket with the MongoDB database.
     * 
     * This method first retrieves the IDs of all test results currently stored in the database.
     * It then fetches the names of all folders in the bucket, and for each folder, it fetches the names of all test result files.
     * The test results are retrieved from the bucket and added to an array.
     * 
     * After all test results have been fetched from the bucket, the method filters out any test results that are already stored in the database.
     * If there are any new test results, the method attempts to save them to the database.
     * If an error occurs while saving a test result, the method logs the error and throws a new error.
     * 
     * @returns {Promise<void>} A promise that resolves when all new test results have been saved to the database, or rejects if an error occurs.
     */
    public async syncTestResults(): Promise<void> {
        // Retrieve the IDs of all stored test results
        const storedTestResultIds: string[] = (await PlaywrightJSONReportModel.find({}, { _id: 1 })).map((testResult) => testResult._id);

        // Retrieve the names of all test result folders in the bucket browser
        const testResultFolders: string[] = await getBucketBrowserTestRunFolderNames();

        let allBucketBrowserTestSuiteRunResult: PlaywrightJSONReport[] = [];

        // Retrieve the test results from each folder
        await Promise.all(testResultFolders.map(async (folderName: string) => {
            // Retrieve the names of all test result files in the folder
            const testSuiteRunResultFileNames: string[] = await getBucketBrowserTestRunResultFileNames(folderName);
            // Retrieve the test results from the files
            const testSuiteRunResult: PlaywrightJSONReport[] = await getBucketBrowserTestSuiteRunResults(folderName, testSuiteRunResultFileNames);
            // Add the test results to the array
            allBucketBrowserTestSuiteRunResult = allBucketBrowserTestSuiteRunResult.concat(testSuiteRunResult);
        }));

        // Filter out the test results that are already stored
        const newBucketBrowserTestSuiteRunResult: PlaywrightJSONReport[] = allBucketBrowserTestSuiteRunResult.filter((testResult) => !storedTestResultIds.includes(testResult._id));

        // If there are new test results, store them in the database
        if (newBucketBrowserTestSuiteRunResult.length > 0) {
            try {
                await Promise.all(newBucketBrowserTestSuiteRunResult.map(async (testResult: PlaywrightJSONReport) => {
                    // Store the test result in the database, using its ID as the key
                    await PlaywrightJSONReportModel.findOneAndUpdate({ _id: testResult._id }, testResult, { upsert: true });
                }));
            } catch (error) {
                // Log any errors that occur during the storage process
                console.error(error);
                throw new Error('Error saving test result');
            }
        }
    }

    /**
     * Retrieves test results from the MongoDB database.
     * 
     * This method queries the database for test results. If a `from` date is provided, 
     * it retrieves only the test results that started on or after this date. 
     * Otherwise, it retrieves all test results.
     * 
     * The method excludes the `config` and `errors` fields from the results.
     * The results are sorted in descending order by start time, so the most recent test results are returned first.
     * 
     * @param {Date} [from] - The date from which to retrieve test results. If provided, only test results that started on or after this date are retrieved.
     * @returns {Promise<PlaywrightJSONReport[]>} A promise that resolves to an array of test results.
     */
    public async getTestResults(from?: Date): Promise<PlaywrightJSONReport[]> {
        const query = from
            ? { 'result.stats.startTime': { $gte: from.toISOString() } }
            : {};

        return await PlaywrightJSONReportModel.find(query, {
            'result.config': 0, 'result.errors': 0
        }).sort({
            'result.stats.startTime': -1
        });
    }

    /**
     * Retrieves the latest test results for each application from the PlaywrightJSONReportModel collection.
     *
     * The function uses MongoDB's aggregation framework to sort the documents by the 'result.stats.startTime' field in descending order, group them by the 'applicationName' field, and get the first document (i.e., the latest test result) in each group.
     * The '$replaceRoot' stage replaces the root of each document with the 'latestResult' field, so the output documents have the same structure as the input documents.
     *
     * @returns {Promise<PlaywrightJSONReport[]>} A promise that resolves to an array of the latest PlaywrightJSONReport objects for each application.
     */
    public async getLatestTestResults(): Promise<PlaywrightJSONReport[]> {
        return await PlaywrightJSONReportModel.aggregate([
            {
                $sort: {
                    'result.stats.startTime': -1
                }
            },
            {
                $group: {
                    _id: '$applicationName',
                    latestResult: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$latestResult'
                }
            }
        ]);
    }

    /**
     * Retrieves and aggregates test results from the MongoDB database.
     * 
     * @param {Date} [from] - The date from which to retrieve test results. If provided, only test results that started on or after this date are retrieved.
     * @returns {Promise<AggregatedSuiteResult[]>} A promise that resolves to an array of aggregated test results.
     */
    public async getAggregatedTestResults(from?: Date): Promise<AggregatedSuiteResult[]> {
        const testResults: PlaywrightJSONReport[] = await this.getTestResults(from);
        return aggregateTestResults(testResults);
    }

    /**
     * Retrieves the latest aggregated test results for each application.
     *
     * @returns {Promise<AggregatedSuiteResult[]>} A promise that resolves to an array of the latest AggregatedSuiteResult objects for each application.
     */
    public async getLatestAggregatedTestResults(): Promise<AggregatedSuiteResult[]> {
        const testResults: PlaywrightJSONReport[] = await this.getLatestTestResults();
        return aggregateTestResults(testResults);
    }
}