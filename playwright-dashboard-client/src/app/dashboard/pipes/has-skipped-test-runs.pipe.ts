import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregatedSuiteResult';

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
