import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import {
  AggregatedSpecResult,
  AggregatedSpecRun,
  AggregatedSuiteResult,
} from '../../../interfaces/aggregatedSuiteResult';
import { DashboardTestResultsRepository } from '../../repositories/dashboard-test-results-repository-service';
import { TestStatus } from '../../../interfaces/testStatus';

export const DEFAULT_SUITE_RUN_COUNT_OPTION = '7';
export const DEFAULT_FILTER_OPTION = '';
export const DEBOUNCE_TIME_IN_MS = 500;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected allAggregatedTestResults$: Observable<AggregatedSuiteResult[]>;
  protected filteredTestResults$: BehaviorSubject<AggregatedSuiteResult[]> =
    new BehaviorSubject([]);
  protected flakyTestsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  protected allPassedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  protected allFailedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  protected queryForm: FormGroup;
  protected isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected TestStatus = TestStatus;
  private _destroyed$ = new Subject<void>();

  constructor(
    private readonly _dashboardTestResultsRepository: DashboardTestResultsRepository,
    private readonly _fb: FormBuilder
  ) { }

  public ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();
  }

  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  public testTitle(_: number, test: AggregatedSpecResult): string {
    return test.title;
  }

  public testRunSpecId(_: number, testRun: AggregatedSpecRun): string {
    return testRun.specId;
  }

  public get filterValue(): any {
    return this.queryForm.get('filter').value;
  }

  private initializeForm(): void {
    this.queryForm = this._fb.group({
      lastRunCount: DEFAULT_SUITE_RUN_COUNT_OPTION,
      filter: DEFAULT_FILTER_OPTION,
      search: ''
    });
  }

  private setupFormValueChanges(): void {
    this.allAggregatedTestResults$ = this.queryForm
      .get('lastRunCount')
      .valueChanges.pipe(
        startWith(this.queryForm.get('lastRunCount').value),
        switchMap((lastRunCount) => {
          this.isLoading$.next(true);
          return this._dashboardTestResultsRepository
            .getAllAggregatedTestResults(lastRunCount)
            .pipe(finalize(() => this.isLoading$.next(false)));
        }),
        takeUntil(this._destroyed$)
      );

    // Combine the test results with the filter form control value changes
    combineLatest([
      this.allAggregatedTestResults$,
      this.queryForm
        .get('filter')
        .valueChanges.pipe(startWith(this.queryForm.get('filter').value)),
      this.queryForm
        .get('search')
        .valueChanges.pipe(startWith(this.queryForm.get('search').value), debounceTime(DEBOUNCE_TIME_IN_MS)),
    ])
      .pipe(
        map(([results, filter, search]) =>
          // Apply the filter to the results
          this.filterTestResults(results, filter, search)
        ),
        takeUntil(this._destroyed$)
      )
      .subscribe((filteredResults) => {
        this.filteredTestResults$.next(filteredResults);
        // Calculate statistics
        this.calculateTestsCountStatistics(filteredResults);
      });
  }

  private calculateTestsCountStatistics(
    testResults: AggregatedSuiteResult[]
  ): void {
    let flakyCount = 0;
    let allPassedCount = 0;
    let allFailedCount = 0;
    testResults.forEach((suiteResult) => {
      suiteResult.specs.forEach((spec) => {
        const flaky = spec.runs.some((run) =>
          run.tests.some((test) => test.status === TestStatus.Flaky)
        );
        const allPassed = spec.runs.every((run) =>
          run.tests.some((test) => test.status === TestStatus.Expected)
        );
        const allFailed = spec.runs.every((run) =>
          run.tests.some((test) => test.status === TestStatus.Unexpected)
        );
        if (flaky) flakyCount++;
        if (allPassed) allPassedCount++;
        if (allFailed) allFailedCount++;
      });
    });
    this.flakyTestsCount$.next(flakyCount);
    this.allPassedTestsCount$.next(allPassedCount);
    this.allFailedTestsCount$.next(allFailedCount);
  }

  private filterTestResults(
    testResults: AggregatedSuiteResult[],
    filter: string,
    search: string
  ): AggregatedSuiteResult[] {
    let results = testResults;

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      results = results.filter(
        (suiteResult: AggregatedSuiteResult) =>
          suiteResult.suiteTitle.toLowerCase().includes(lowerCaseSearch) ||
          suiteResult.specs.some((spec) =>
            spec.title.toLowerCase().includes(lowerCaseSearch)
          )
      );
    }

    if (filter === TestStatus.Flaky) {
      results = results
        .map((suiteResult: AggregatedSuiteResult) => ({
          ...suiteResult,
          specs: suiteResult.specs.filter((spec) =>
            spec.runs.some((run) =>
              run.tests.some((test) => test.status === TestStatus.Flaky)
            )
          ),
        }))
        .filter((suiteResult) => suiteResult.specs.length > 0);
    }

    return results;
  }
}
