import mongoose from 'mongoose';
import {
    JSONReportSpec, JSONReportSuite, JSONReportTest,
    JSONReportTestResult, JSONReportTestStep, Location, TestError
} from '../types/testReporter';
import { PlaywrightJSONReport } from './playwright-json-report';
const { Schema } = mongoose;

const MetadataSchema = Schema.Types.Mixed;

const LocationSchema = new Schema<Location>({
    column: Number,
    file: String,
    line: Number,
}, { _id: false });

const TestErrorSchema = new Schema<TestError>({
    location: LocationSchema,
    message: String,
    snippet: String,
    stack: String,
    value: String,
}, { _id: false });

const JSONReportTestStepSchema = new Schema<JSONReportTestStep>({
    title: String,
    duration: Number,
    error: TestErrorSchema,
}, { _id: false });

const JSONReportTestResultSchema = new Schema<JSONReportTestResult>({
    workerIndex: Number,
    status: String,
    duration: Number,
    error: TestErrorSchema,
    errors: [TestErrorSchema],
    stdout: [{ text: String, buffer: String }],
    stderr: [{ text: String, buffer: String }],
    retry: Number,
    steps: [JSONReportTestStepSchema],
    startTime: String,
    attachments: [{
        name: String,
        path: String,
        body: String,
        contentType: String,
    }],
    errorLocation: LocationSchema,
}, { _id: false });

const JSONReportTestSchema = new Schema<JSONReportTest>({
    timeout: Number,
    annotations: [{ type: String, description: String }],
    expectedStatus: String,
    projectName: String,
    projectId: String,
    results: [JSONReportTestResultSchema],
    status: String,
});

const JSONReportSpecSchema = new Schema<JSONReportSpec>({
    tags: [String],
    title: String,
    ok: Boolean,
    tests: [JSONReportTestSchema],
    id: String,
    file: String,
    line: Number,
    column: Number,
}, { _id: false });

const JSONReportSuiteSchema = new Schema<JSONReportSuite>({
    title: String,
    file: String,
    column: Number,
    line: Number,
    specs: [JSONReportSpecSchema],
}, { _id: false });

const JSONReportProjectSchema = new Schema({
    outputDir: String,
    repeatEach: Number,
    retries: Number,
    metadata: MetadataSchema,
    id: String,
    name: String,
    testDir: String,
    testIgnore: [String],
    testMatch: [String],
    timeout: Number,
}, { _id: false });

const JSONReportSchema = new Schema<PlaywrightJSONReport>({
    _id: {
        type: String,
        required: true,
    },
    config: {
        metadata: MetadataSchema,
        projects: [JSONReportProjectSchema],
    },
    suites: [JSONReportSuiteSchema],
    errors: [TestErrorSchema],
    stats: {
        startTime: String,
        duration: Number,
        expected: Number,
        unexpected: Number,
        flaky: Number,
        skipped: Number,
    },
});

export const JSONReportModel = mongoose.model('JSONReport', JSONReportSchema);
