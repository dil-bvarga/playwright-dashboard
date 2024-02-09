import { Pipe, PipeTransform } from '@angular/core';

/**
 * `LatestSuiteRunTimePipe` is a pipe that calculates the time elapsed since the start of a suite run.
 */
@Pipe({
  name: 'latestSuiteRunTime',
})
export class LatestSuiteRunTimePipe implements PipeTransform {
  public transform(suiteRunStartDate: Date | null): string {
    if (!suiteRunStartDate) {
      return '';
    }

    const now = new Date();
    const diffInMilliseconds =
      now.getTime() - new Date(suiteRunStartDate).getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
    const diffInHours = Math.floor(diffInMilliseconds / 1000 / 60 / 60);
    const diffInDays = Math.floor(diffInMilliseconds / 1000 / 60 / 60 / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  }
}
