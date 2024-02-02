import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregatedSuiteResult';

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