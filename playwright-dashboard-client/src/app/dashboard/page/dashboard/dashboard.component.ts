import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  debounceTime,
  finalize,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import {
  AggregatedSpecResult,
  AggregatedSpecRun,
  AggregatedSuiteResult,
  AggregatedTestResult,
} from '../../../interfaces/aggregated-suite-result';
import { TestStatus } from '../../../interfaces/test-status';
import { Interval } from '../../../interfaces/interval';
import { TestResultsRepository } from '../../services/test-results-repository-service';

export const DEFAULT_FROM_OPTION = Interval.Week;
export const DEFAULT_FILTER_OPTION = '';
export const DEFAULT_TEST_STATUS_FILTER_OPTION = TestStatus.Flaky;
export const DEBOUNCE_TIME_IN_MS = 500;
export const MAX_RUNS_FOR_MINIMIZED_VIEW = 40;

/**
 * `DashboardComponent` is an Angular component that manages the dashboard view.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** An Observable of all aggregated test results. */
  protected allAggregatedTestResults$: Observable<AggregatedSuiteResult[]>;
  /** A BehaviorSubject of filtered test results. */
  protected filteredTestResults$: BehaviorSubject<AggregatedSuiteResult[]> =
    new BehaviorSubject([]);
  /** A BehaviorSubject of the count of flaky tests. */
  protected flakyTestsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  /** A BehaviorSubject of the count of all passed tests. */
  protected allPassedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(
    0
  );
  /** A BehaviorSubject of the count of all failed tests. */
  protected allFailedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(
    0
  );
  /** A FormGroup for handling the query form. */
  protected queryForm: FormGroup;
  /** A BehaviorSubject indicating whether the test result data is loading. */
  protected isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** A reference to the TestStatus enum. */
  protected readonly TestStatus = TestStatus;
  /** A reference to the Interval enum. */
  protected readonly Interval = Interval;
  /** The maximum number of runs for a test to be considered for minimized view. */
  protected readonly maxRunsForMinimizedView = MAX_RUNS_FOR_MINIMIZED_VIEW;
  /** A getter that returns a sorted array of unique application names. */
  protected get applications(): string[] {
    return Array.from(this._applications).sort();
  }
  private _applications: Set<string> = new Set<string>();
  private _destroyed$ = new Subject<void>();

  constructor(
    private readonly _testResultsRepository: TestResultsRepository,
    private readonly _fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();
  }

  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  /**
   * Returns the suite file of a given test suite result for Angular's trackBy function in *ngFor.
   *
   * @param {number} _ - The index of the test suite result. This parameter is not used.
   * @param {AggregatedSuiteResult} testSuiteResult - The test suite result object.
   * @returns {string} The suite file of the test suite result.
   */
  public trackByTestSuiteFile(
    _: number,
    testSuiteResult: AggregatedSuiteResult
  ): string {
    return testSuiteResult.suiteFile;
  }

  /**
   * Returns the title of a given test result for Angular's trackBy function in *ngFor.
   *
   * @param {number} _ - The index of the test result. This parameter is not used.
   * @param {AggregatedSpecResult} testResult - The test result object.
   * @returns {string} The title of the test result.
   */
  public trackByTestTitle(_: number, testResult: AggregatedSpecResult): string {
    return testResult.title;
  }

  /**
   * Returns the spec ID of a given test run for Angular's trackBy function in *ngFor.
   *
   * @param {number} _ - The index of the test run. This parameter is not used.
   * @param {AggregatedSpecRun} testRun - The test run object.
   * @returns {string} The spec ID of the test run.
   */
  public trackByTestRunSpecId(_: number, testRun: AggregatedSpecRun): string {
    return testRun.specId;
  }

  /**
   * Returns the current value of the 'testStatusFilter' field from the query form.
   *
   * @returns {string} The value of the 'testStatusFilter' field.
   */
  public get testStatusFilterValue(): string {
    return this.queryForm.get('testStatusFilter').value;
  }

  /**
   * Returns the current value of the 'applicationFilter' field from the query form.
   *
   * @returns {string} The value of the 'applicationFilter' field.
   */
  public get applicationFilterValue(): string {
    return this.queryForm.get('applicationFilter').value;
  }

  /**
   * Returns the current value of the 'search' field from the query form.
   *
   * @returns {string} The value of the 'search' field.
   */
  public get searchValue(): string {
    return this.queryForm.get('search').value;
  }

  /**
   * Opens the details file of a given test run in a new browser tab.
   *
   * @param {AggregatedSpecRun} testRun - The test run object.
   */
  public openTestRunDetailsFile(testRun: AggregatedSpecRun): void {
    window.open(testRun.specResultFileUrl, '_blank');
  }

  /** Initializes the query form with default values. */
  private initializeForm(): void {
    this.queryForm = this._fb.group({
      from: DEFAULT_FROM_OPTION,
      testStatusFilter: DEFAULT_TEST_STATUS_FILTER_OPTION,
      applicationFilter: DEFAULT_FILTER_OPTION,
      search: DEFAULT_FILTER_OPTION,
    });
  }

  /**
   * Sets up the form value changes subscriptions.
   */
  private setupFormValueChanges(): void {
    const { from, testStatusFilter, applicationFilter, search } =
      this.queryForm.controls;

    this.allAggregatedTestResults$ = from.valueChanges.pipe(
      startWith(from.value),
      switchMap((fromValue: Interval) => {
        this.isLoading$.next(true);
        return this.getResults(fromValue).pipe(
          map(this.sortResults),
          finalize(() => this.isLoading$.next(false))
        );
      }),
      tap((results: AggregatedSuiteResult[]) => {
        results.forEach((suiteResult: AggregatedSuiteResult) => {
          this._applications.add(suiteResult.applicationName);
        });
        if (!this.applicationFilterValue) {
          applicationFilter.setValue(Array.from(this.applications)[0]);
        }
      }),
      takeUntil(this._destroyed$)
    );

    combineLatest([
      this.allAggregatedTestResults$,
      testStatusFilter.valueChanges.pipe(startWith(testStatusFilter.value)),
      applicationFilter.valueChanges.pipe(startWith(applicationFilter.value)),
      search.valueChanges.pipe(
        startWith(search.value),
        debounceTime(DEBOUNCE_TIME_IN_MS)
      ),
    ])
      .pipe(takeUntil(this._destroyed$))
      .subscribe(([testResults, testStatus, application, searchValue]) => {
        const filteredResults: AggregatedSuiteResult[] = this.filterTestResults(
          testResults,
          testStatus,
          application,
          searchValue
        );
        this.filteredTestResults$.next(filteredResults);
        this.calculateTestsCountStatistics(filteredResults);
      });
  }

  /**
   * Retrieves aggregated test results based on the provided 'fromValue' parameter.
   *
   * - If 'fromValue' is 'Interval.LastRun', it retrieves the latest aggregated test results.
   * - Otherwise, it retrieves all aggregated test results from a specific date, which is calculated based on 'fromValue'.
   *
   * @param {Interval} fromValue - The enum representing the date range.
   * @returns {Observable<AggregatedSuiteResult[]>} An Observable that emits an array of AggregatedSuiteResult objects.
   */
  private getResults(fromValue: Interval): Observable<AggregatedSuiteResult[]> {
    if (fromValue === Interval.LastRun) {
      return this._testResultsRepository.getLatestAggregatedTestResults();
    } else {
      return this._testResultsRepository.getAllAggregatedTestResults(
        this.getFromDate(fromValue)
      );
    }
  }

  /**
   * Sorts an array of AggregatedSuiteResult objects in place by the suiteTitle property in ascending order.
   *
   * @param {AggregatedSuiteResult[]} results - The array of AggregatedSuiteResult objects to sort.
   * @returns {AggregatedSuiteResult[]} The sorted array of AggregatedSuiteResult objects.
   */
  private sortResults(
    results: AggregatedSuiteResult[]
  ): AggregatedSuiteResult[] {
    return results.sort((a, b) => a.suiteTitle.localeCompare(b.suiteTitle));
  }

  /**
   * Calculates and returns a date based on the provided 'from' parameter.
   *
   * - If 'from' is 'Interval.Day', it returns the date of the previous day.
   * - If 'from' is 'Interval.Week', it returns the date of the same day in the previous week.
   * - If 'from' is 'Interval.Month', it returns the date of the same day in the previous month.
   * - If 'from' is not recognized, it defaults to returning the date of the previous day.
   *
   * @param {Interval} from - The enum representing the date range.
   * @returns {Date} The calculated date.
   */
  private getFromDate(from: Interval): Date {
    const now = new Date();

    switch (from) {
      case Interval.Day:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      case Interval.Week:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case Interval.Month:
        return new Date(
          new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        );
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    }
  }

  /**
   * Calculates the count of flaky, all passed, and all failed tests from the given test results.
   *
   * @param {AggregatedSuiteResult[]} testResults - The array of test results to calculate statistics from.
   */
  private calculateTestsCountStatistics(
    testResults: AggregatedSuiteResult[]
  ): void {
    let flakyCount = 0;
    let allPassedCount = 0;
    let allFailedCount = 0;

    testResults.forEach((suiteResult: AggregatedSuiteResult) => {
      suiteResult.specs.forEach((spec: AggregatedSpecResult) => {
        const hasFlakyTestRun: boolean = spec.runs.some(
          (run: AggregatedSpecRun) =>
            run.tests.some(
              (test: AggregatedTestResult) => test.status === TestStatus.Flaky
            )
        );
        const isAllTestRunPassed: boolean = spec.runs.every(
          (run: AggregatedSpecRun) =>
            run.tests.some(
              (test: AggregatedTestResult) =>
                test.status === TestStatus.Expected
            )
        );
        const isAllTestFailed: boolean = spec.runs.every(
          (run: AggregatedSpecRun) =>
            run.tests.some(
              (test: AggregatedTestResult) =>
                test.status === TestStatus.Unexpected
            )
        );
        if (hasFlakyTestRun) flakyCount++;
        if (isAllTestRunPassed) allPassedCount++;
        if (isAllTestFailed) allFailedCount++;
      });
    });

    this.flakyTestsCount$.next(flakyCount);
    this.allPassedTestsCount$.next(allPassedCount);
    this.allFailedTestsCount$.next(allFailedCount);
  }

  /**
   * Filters the given test results based on the provided filters.
   *
   * @param {AggregatedSuiteResult[]} testResults - The array of test results to filter.
   * @param {string} testStatusFilter - The test status filter.
   * @param {string} applicationFilter - The application filter.
   * @param {string} search - The search string.
   * @returns {AggregatedSuiteResult[]} The filtered array of test results.
   */
  private filterTestResults(
    testResults: AggregatedSuiteResult[],
    testStatusFilter: string,
    applicationFilter: string,
    search: string
  ): AggregatedSuiteResult[] {
    let results: AggregatedSuiteResult[] = testResults;

    if (applicationFilter) {
      results = results.filter(
        (suiteResult: AggregatedSuiteResult) =>
          suiteResult.applicationName === applicationFilter
      );
    }

    if (search) {
      const lowerCaseSearch: string = search.toLowerCase();
      results = results.filter(
        (suiteResult: AggregatedSuiteResult) =>
          suiteResult.suiteTitle.toLowerCase().includes(lowerCaseSearch) ||
          suiteResult.specs.some((spec: AggregatedSpecResult) =>
            spec.title.toLowerCase().includes(lowerCaseSearch)
          )
      );
    }

    if (testStatusFilter) {
      results = results
        .map((suiteResult: AggregatedSuiteResult) => ({
          ...suiteResult,
          specs: suiteResult.specs.filter((spec: AggregatedSpecResult) =>
            spec.runs.some((run: AggregatedSpecRun) =>
              run.tests.some(
                (test: AggregatedTestResult) => test.status === testStatusFilter
              )
            )
          ),
        }))
        .filter((suiteResult) => suiteResult.specs.length > 0);
    }

    return results;
  }
}
