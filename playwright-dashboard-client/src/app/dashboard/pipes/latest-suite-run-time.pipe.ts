import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedSuiteResult } from '../../interfaces/aggregatedSuiteResult';

@Pipe({
  name: 'latestSuiteRunTime',
})
export class LatestSuiteRunTimePipe implements PipeTransform {
  public transform(suiteResult: AggregatedSuiteResult): number {
    let latestTestRunStartTime = new Date(0);

    suiteResult.specs.forEach((spec) => {
      spec.runs.forEach((run) => {
        const resultStartTime = new Date(run.suiteRunStartTime);
        if (resultStartTime > latestTestRunStartTime) {
          latestTestRunStartTime = resultStartTime;
        }
      });
    });

    const now = new Date();
    const differenceInMinutes =
      (now.getTime() - latestTestRunStartTime.getTime()) / 1000 / 60;
    return Math.floor(differenceInMinutes);
  }
}
