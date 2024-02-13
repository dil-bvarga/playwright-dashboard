import { Request, Response } from 'express';
import { AggregatedSuiteResult } from '../interfaces/aggregated-suite-result';
import { PlaywrightTestResultMongoService } from '../services/playwright-test-result-mongo-service';

const playwrightTestResultService = new PlaywrightTestResultMongoService();

/**
 * Retrieves all aggregated test results from the database and sends them as a JSON response.
 * 
 * This function first checks if a `from` query parameter is provided in the request.
 * If it is, the function converts it to a Date object and retrieves only the test results that started on or after this date.
 * Otherwise, it retrieves all test results.
 * 
 * The test results are then aggregated and sent as a JSON response with a status code of 200.
 * 
 * If an error occurs while retrieving the test results, the function logs the error and sends a JSON response with a status code of 500 and a generic error message.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the response has been sent, or rejects if an error occurs.
 */
export async function getAllAggregatedTestResults(req: Request, res: Response): Promise<void> {
    try {
        const from = req?.query?.from ? new Date(req.query.from as string) : undefined;
        const aggregatedTestResults: AggregatedSuiteResult[] = await playwrightTestResultService.getAggregatedTestResults(from);
        res.status(200).json(aggregatedTestResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error reading aggregated test results' });
    }
}

/**
 * Retrieves latest aggregated test results from the database and sends them as a JSON response.
 *
 * The function calls 'getLatestAggregatedTestResults' from the 'playwrightTestResultService' to retrieve the latest aggregated test results.
 * If successful, it sends a response with a status code of 200 and the latest aggregated test results in JSON format.
 * If an error occurs, it sends a response with a status code of 500 and a JSON object containing an error message.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The outgoing HTTP response.
 * @returns {Promise<void>} A promise that resolves when the function has finished processing the request.
 */
export async function getLatestAggregatedTestResults(req: Request, res: Response): Promise<void> {
    try {
        const latestAggregatedTestResults: AggregatedSuiteResult[] = await playwrightTestResultService.getLatestAggregatedTestResults();
        res.status(200).json(latestAggregatedTestResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error reading latest aggregated test results' });
    }
}

/**
 * Synchronizes test results from a bucket with the MongoDB database and sends a JSON response.
 * 
 * This function calls `syncTestResults` to synchronize the test results.
 * If the synchronization is successful, the function sends a JSON response with a status code of 200 and a success message.
 * 
 * If an error occurs while synchronizing the test results, the function logs the error and sends a JSON response with a status code of 500 and a generic error message.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} A promise that resolves when the response has been sent, or rejects if an error occurs.
 */
export async function syncTestResults(req: Request, res: Response): Promise<void> {
    try {
        await playwrightTestResultService.syncTestResults();
        res.status(200).json({ message: 'Test results synced' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving test result' });
    }
}
