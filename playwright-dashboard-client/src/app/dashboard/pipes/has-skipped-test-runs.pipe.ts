import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregated-suite-result';

/**
 * `HasSkippedTestRunsPipe` is a pipe that checks if any test results have a status of 'skipped'.
 */
@Pipe({
  name: 'hasSkippedTestRuns',
})
export class HasSkippedTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.some(
      (test: AggregatedTestResult) => test.status === 'skipped'
    );
  }
}
