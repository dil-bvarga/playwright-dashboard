import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregated-suite-result';

/**
 * `AllExpectedTestRunsPipe` is a pipe that checks if all test results have a status of 'expected'.
 */
@Pipe({
  name: 'allExpectedTestRuns',
})
export class AllExpectedTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.every(
      (test: AggregatedTestResult) => test.status === 'expected'
    );
  }
}
