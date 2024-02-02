import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregatedSuiteResult';

@Pipe({
  name: 'allExpectedTestRuns',
})
export class AllExpectedTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.every((test: AggregatedTestResult) => test.status === 'expected');
  }
}
