import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregated-suite-result';

/**
 * `HasFlakyTestRunsPipe` is a pipe that checks if any test results have a status of 'flaky'.
 */
@Pipe({
  name: 'hasFlakyTestRuns',
})
export class HasFlakyTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.some(
      (test: AggregatedTestResult) => test.status === 'flaky'
    );
  }
}
