import convert from 'xml-js';
import fetch from 'node-fetch';
import { JSONReport } from '../types/testReporter';
import { PlaywrightJSONReport } from '../interfaces/playwright-json-report';

// Get test suite run folder names from the bucket browser
export async function getBucketBrowserTestRunFolderNames(): Promise<string[]> {
    const bucketBrowserApiUrlPrefix = process.env.BUCKET_BROWSER_API_URL_PREFIX;

    if (!bucketBrowserApiUrlPrefix) {
        throw new Error('BUCKET_BROWSER_API_URL_PREFIX is not set');
    }

    let testRunFolders: string[] = [];

    const bucketBrowserTestSuiteRunApiUrl = `${bucketBrowserApiUrlPrefix}/&max-keys=50`;

    const bucketBrowserTestRunFolders = await fetch(bucketBrowserTestSuiteRunApiUrl, {
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

    if (bucketBrowserTestRunFolders) {
        bucketBrowserTestRunFolders?.ListBucketResult?.CommonPrefixes?.forEach((prefix: any) => {
            const urlParts = prefix.Prefix._text.split('/');
            testRunFolders.push(urlParts[urlParts.length - 2]);
        });
    }

    return testRunFolders;
}

// Get test result file names of a test run from the bucket browser
export async function getBucketBrowserTestRunResultFileNames(testSuiteRunFolderName: string = ''): Promise<string[]> {
    const bucketBrowserApiUrlPrefix = process.env.BUCKET_BROWSER_API_URL_PREFIX;
    const bucketBrowserResultFolderName = process.env.BUCKET_BROWSER_RESULT_FOLDER_NAME;

    if (!bucketBrowserApiUrlPrefix) {
        throw new Error('BUCKET_BROWSER_API_URL_PREFIX is not set');
    } else if (!bucketBrowserResultFolderName) {
        throw new Error('BUCKET_BROWSER_RESULT_FOLDER_NAME is not set');
    }

    let fileNames: string[] = [];

    const bucketBrowserTestSuiteRunResultFolderApiUrl = `${bucketBrowserApiUrlPrefix}/${testSuiteRunFolderName}/${bucketBrowserResultFolderName}/&max-keys=50`;

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

// Get test result of a test run from the bucket browser
export async function getBucketBrowserTestSuiteRunResults(testSuiteRunFolderName: string = '', testSuiteRunFileNames: string[] = []): Promise<PlaywrightJSONReport[]> {
    const bucketBrowserClientUrlPrefix = process.env.BUCKET_BROWSER_CLIENT_URL_PREFIX;
    const bucketBrowserResultFolderName = process.env.BUCKET_BROWSER_RESULT_FOLDER_NAME;

    if (!bucketBrowserClientUrlPrefix) {
        throw new Error('BUCKET_BROWSER_CLIENT_URL_PREFIX is not set');
    } else if (!bucketBrowserResultFolderName) {
        throw new Error('BUCKET_BROWSER_RESULT_FOLDER_NAME is not set');
    }

    let testResult: PlaywrightJSONReport[] = [];

    await Promise.all(testSuiteRunFileNames.map(async (fileName: string) => {
        const bucketBrowserTestSuiteRunResultFileClientUrl = `${bucketBrowserClientUrlPrefix}/${testSuiteRunFolderName}/${bucketBrowserResultFolderName}/${fileName}`;

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
