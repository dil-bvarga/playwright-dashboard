import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregatedSuiteResult';

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
