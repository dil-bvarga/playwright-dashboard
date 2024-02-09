import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregated-suite-result';

/**
 * `HasUnexpectedTestRunsPipe` is a pipe that checks if any test results have a status of 'unexpected'.
 */
@Pipe({
  name: 'hasUnexpectedTestRuns',
})
export class HasUnexpectedTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.some(
      (test: AggregatedTestResult) => test.status === 'unexpected'
    );
  }
}
