import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTestResult } from '../../interfaces/aggregated-suite-result';

@Pipe({
  name: 'allExpectedTestRuns',
})
export class AllExpectedTestRunsPipe implements PipeTransform {
  public transform(testResult: AggregatedTestResult[]): boolean {
    return testResult.every((test: AggregatedTestResult) => test.status === 'expected');
  }
}
