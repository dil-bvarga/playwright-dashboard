/**
 * `TestStatus` is an enumeration of possible statuses for a test.
 */
export enum TestStatus {
  Expected = 'expected',
  Unexpected = 'unexpected',
  Flaky = 'flaky',
  Skipped = 'skipped',
}
