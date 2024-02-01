import { PlaywrightTestResultReader } from '../interfaces/playwrightTestResultReader';
import { PlaywrightTestResultWriter } from '../interfaces/playwrightTestResultWriter';
import fs from 'fs';
import path from 'path';
import { JSONReport } from '../types/testReporter';
import { AggregatedSuiteResult } from '../interfaces/aggregatedSuiteResult';
import { start } from 'repl';


export class PlaywrightTestResultLocalDirectoryService implements PlaywrightTestResultReader, PlaywrightTestResultWriter {
    constructor(private readonly _sourceDirectory: string, private readonly _destinationDirectory: string) { }
    // Implementation for copying data from the source directory to the destination directory
    public async saveTestResults(testResults: JSONReport[]): Promise<any[]> {
        const newSourceTestFolders = fs.readdirSync(this._sourceDirectory, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);


        for (const folder of newSourceTestFolders) {
            const sourceFilePath = path.join(this._sourceDirectory, folder, 'results.json');
            const destinationFolderPath = path.join(this._destinationDirectory, folder);
            const destinationFilePath = path.join(destinationFolderPath, 'results.json');

            if (!fs.existsSync(sourceFilePath)) {
                throw new Error('Source file does not exist');
            }

            if (!fs.existsSync(destinationFolderPath)) {
                fs.mkdirSync(destinationFolderPath);
            }

            await this.copyFiles(sourceFilePath, destinationFilePath);

            this.removeDirectory(path.join(this._sourceDirectory, folder));
        }

        return testResults;
    }

    private async copyFiles(source: string, destination: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(source);
            const writeStream = fs.createWriteStream(destination);

            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);

            readStream.pipe(writeStream);
        });
    }

    private removeDirectory(directoryPath: string): void {
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach((file) => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // Recurse
                    this.removeDirectory(curPath);
                } else {
                    // Delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
        }
    }

    // Implementation for reading data from the destination directory
    public async getTestResults(): Promise<JSONReport[]> {
        let results: JSONReport[] = [];
        const testFolders = fs.readdirSync(this._destinationDirectory, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of testFolders) {
            const resultPath = path.join(this._destinationDirectory, folder, 'results.json');
            if (fs.existsSync(resultPath)) {
                const data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                results.push(data);
            }
        }

        return results.sort((a, b) => {
            const dateA = new Date(a.stats.startTime);
            const dateB = new Date(b.stats.startTime);
            return dateB.getTime() - dateA.getTime();
        });
    }

    public async getAggregatedTestResults(): Promise<AggregatedSuiteResult[]> {
        const testResults: JSONReport[] = await this.getTestResults();
        return this.aggregateTestResults(testResults);
    }

    private aggregateTestResults(reports: JSONReport[]): AggregatedSuiteResult[] {
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
                        aggregatedSpec = { title: spec.title, runs: [] };
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
                                //error: result.error,
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

                //aggregatedSuite.suiteRuns.push(report);
            });
        });

        return Object.values(aggregatedSuites);
    }
}