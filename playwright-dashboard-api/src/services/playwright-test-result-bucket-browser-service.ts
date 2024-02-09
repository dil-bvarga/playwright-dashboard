import convert from 'xml-js';
import fetch from 'node-fetch';
import { JSONReport } from '../types/testReporter';
import { PlaywrightJSONReport } from '../interfaces/playwright-json-report';

/**
 * Retrieves the names of test run folders from the bucket browser.
 * 
 * This function fetches the XML response from the bucket browser API, converts it to JSON, 
 * and extracts the names of the test run folders. The bucket browser API URL prefix is retrieved 
 * from the environment variable `BUCKET_BROWSER_API_URL_PREFIX`.
 * 
 * @throws {Error} Throws an error if the `BUCKET_BROWSER_API_URL_PREFIX` environment variable is not set.
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of test run folder names, or rejects if an error occurs.
 */
export async function getBucketBrowserTestRunFolderNames(): Promise<string[]> {
    const bucketBrowserApiUrlPrefix: string = process.env.BUCKET_BROWSER_API_URL_PREFIX;

    if (!bucketBrowserApiUrlPrefix) {
        throw new Error('BUCKET_BROWSER_API_URL_PREFIX is not set');
    }

    let testRunFolders: string[] = [];

    const bucketBrowserTestSuiteRunApiUrl: string = `${bucketBrowserApiUrlPrefix}/&max-keys=50`;

    const bucketBrowserTestRunFolders = await fetch(bucketBrowserTestSuiteRunApiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/xml',
        },
    })
        .then((response: any) => response.text())
        .then((xml: any) => {
            return JSON.parse(convert.xml2json(xml));
        })
        .catch((error: any) => {
            console.error(error);
        });

    if (bucketBrowserTestRunFolders) {
        bucketBrowserTestRunFolders?.ListBucketResult?.CommonPrefixes?.forEach((prefix: any) => {
            const urlParts = prefix.Prefix._text.split('/');
            testRunFolders.push(urlParts[urlParts.length - 2]);
        });
    }

    return testRunFolders;
}

/**
 * Retrieves the names of test run result files from the bucket browser.
 * 
 * This function fetches the XML response from the bucket browser API, converts it to JSON, 
 * and extracts the names of the test run result files. The bucket browser API URL prefix and 
 * result folder name are retrieved from the environment variables `BUCKET_BROWSER_API_URL_PREFIX` 
 * and `BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME` respectively.
 * 
 * @param {string} testSuiteRunFolderName - The name of the test suite run folder. Defaults to an empty string.
 * 
 * @throws {Error} Throws an error if the `BUCKET_BROWSER_API_URL_PREFIX` or `BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME` 
 * environment variables are not set.
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of test run result file names, or rejects if an error occurs.
 */
export async function getBucketBrowserTestRunResultFileNames(testSuiteRunFolderName: string = ''): Promise<string[]> {
    const bucketBrowserApiUrlPrefix: string = process.env.BUCKET_BROWSER_API_URL_PREFIX;
    const bucketBrowserClientResultFolderName: string = process.env.BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME;

    if (!bucketBrowserApiUrlPrefix) {
        throw new Error('BUCKET_BROWSER_API_URL_PREFIX is not set');
    } else if (!bucketBrowserClientResultFolderName) {
        throw new Error('BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME is not set');
    }

    let fileNames: string[] = [];

    const bucketBrowserTestSuiteRunResultFolderApiUrl: string = `${bucketBrowserApiUrlPrefix}/${testSuiteRunFolderName}/${bucketBrowserClientResultFolderName}/&max-keys=50`;

    const bucketBrowserTestSuiteRunResultFiles = await fetch(bucketBrowserTestSuiteRunResultFolderApiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/xml',
        },
    })
        .then((response: any) => response.text())
        .then((xml: any) => {
            return JSON.parse(convert.xml2json(xml, { compact: true, spaces: 4 }));
        })
        .catch((error: any) => {
            console.error(error);
        });

    if (bucketBrowserTestSuiteRunResultFiles) {
        if (Array.isArray(bucketBrowserTestSuiteRunResultFiles?.ListBucketResult?.Contents)) {
            bucketBrowserTestSuiteRunResultFiles?.ListBucketResult?.Contents?.forEach((content: any) => {
                const contentUrlParts = content.Key._text.split('/');
                fileNames.push(contentUrlParts[contentUrlParts.length - 1]);
            });
        } else {
            const contentUrlParts = bucketBrowserTestSuiteRunResultFiles?.ListBucketResult?.Contents?.Key._text.split('/');
            fileNames.push(contentUrlParts[contentUrlParts.length - 1]);
        }
    }

    return fileNames;
}

/**
 * Retrieves the test suite run results from the bucket browser.
 * 
 * This function fetches the JSON response from the bucket browser API for each file in the test suite run, 
 * and constructs a PlaywrightJSONReport object for each. The bucket browser client URL prefix and 
 * result folder name are retrieved from the environment variables `BUCKET_BROWSER_CLIENT_URL_PREFIX` 
 * and `BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME` respectively.
 * 
 * @param {string} testSuiteRunFolderName - The name of the test suite run folder. Defaults to an empty string.
 * @param {string[]} testSuiteRunFileNames - An array of test suite run file names. Defaults to an empty array.
 * 
 * @throws {Error} Throws an error if the `BUCKET_BROWSER_CLIENT_URL_PREFIX` or `BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME` 
 * environment variables are not set.
 * 
 * @returns {Promise<PlaywrightJSONReport[]>} A promise that resolves to an array of PlaywrightJSONReport objects, 
 * or rejects if an error occurs.
 */
export async function getBucketBrowserTestSuiteRunResults(testSuiteRunFolderName: string = '', testSuiteRunFileNames: string[] = []): Promise<PlaywrightJSONReport[]> {
    const bucketBrowserClientUrlPrefix: string = process.env.BUCKET_BROWSER_CLIENT_URL_PREFIX;
    const bucketBrowserClientResultFolderName: string = process.env.BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME;

    if (!bucketBrowserClientUrlPrefix) {
        throw new Error('BUCKET_BROWSER_CLIENT_URL_PREFIX is not set');
    } else if (!bucketBrowserClientResultFolderName) {
        throw new Error('BUCKET_BROWSER_CLIENT_RESULT_FOLDER_NAME is not set');
    }

    let testResult: PlaywrightJSONReport[] = [];

    await Promise.all(testSuiteRunFileNames.map(async (fileName: string) => {
        const bucketBrowserTestSuiteRunResultFileClientUrl: string = `${bucketBrowserClientUrlPrefix}/${testSuiteRunFolderName}/${bucketBrowserClientResultFolderName}/${fileName}`;

        const bucketBrowserTestResult: JSONReport = await fetch(bucketBrowserTestSuiteRunResultFileClientUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response: any) => response.json())
            .catch((error: any) => {
                console.error(error);
            });

        const playwrightJSONReport: PlaywrightJSONReport = {
            _id: testSuiteRunFolderName + '-' + fileName.split('.')[0],
            applicationName: fileName.split('.')[0],
            suiteFolderName: testSuiteRunFolderName,
            result: bucketBrowserTestResult
        };

        testResult.push(playwrightJSONReport);
    }));

    return testResult;
}
