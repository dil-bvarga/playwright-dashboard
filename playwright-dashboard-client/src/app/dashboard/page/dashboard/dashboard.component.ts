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
import { TestResultsRepository } from '../../services/test-results-repository-service';
import { Interval } from 'src/app/interfaces/interval';

export const DEFAULT_FROM_OPTION = Interval.Week;
export const DEFAULT_FILTER_OPTION = '';
export const DEFAULT_TEST_STATUS_FILTER_OPTION = TestStatus.Flaky;
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
  protected allPassedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(
    0
  );
  protected allFailedTestsCount$: BehaviorSubject<number> = new BehaviorSubject(
    0
  );
  protected queryForm: FormGroup;
  protected isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected TestStatus = TestStatus;
  protected Interval = Interval;
  public get applications(): string[] {
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

  public testTitle(_: number, testResult: AggregatedSpecResult): string {
    return testResult.title;
  }

  public testRunSpecId(_: number, testRun: AggregatedSpecRun): string {
    return testRun.specId;
  }

  public testSuiteFile(
    _: number,
    testSuiteResult: AggregatedSuiteResult
  ): string {
    return testSuiteResult.suiteFile;
  }

  public get testStatusFilterValue(): string {
    return this.queryForm.get('testStatusFilter').value;
  }

  public get applicationFilterValue(): string {
    return this.queryForm.get('applicationFilter').value;
  }

  public get searchValue(): string {
    return this.queryForm.get('search').value;
  }

  public openTestRunDetailsFile(testRun: AggregatedSpecRun): void {
    window.open(testRun.specResultFileUrl, '_blank');
  }

  private initializeForm(): void {
    this.queryForm = this._fb.group({
      from: DEFAULT_FROM_OPTION,
      testStatusFilter: DEFAULT_TEST_STATUS_FILTER_OPTION,
      applicationFilter: DEFAULT_FILTER_OPTION,
      search: DEFAULT_FILTER_OPTION,
    });
  }

  private setupFormValueChanges(): void {
    const { from, testStatusFilter, applicationFilter, search } =
      this.queryForm.controls;

    this.allAggregatedTestResults$ = from.valueChanges.pipe(
      startWith(from.value),
      switchMap((fromValue) => {
        this.isLoading$.next(true);
        return this._testResultsRepository
          .getAllAggregatedTestResults(this.getFromDate(fromValue))
          .pipe(finalize(() => this.isLoading$.next(false)));
      }),
      tap((results) => {
        results.forEach((suiteResult) => {
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

  private getFromDate(from: string): Date {
    const now = new Date();

    switch (from) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      case 'week':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'month':
        return new Date(
          new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        );
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    }
  }

  private calculateTestsCountStatistics(
    testResults: AggregatedSuiteResult[]
  ): void {
    let flakyCount = 0;
    let allPassedCount = 0;
    let allFailedCount = 0;

    testResults.forEach((suiteResult) => {
      suiteResult.specs.forEach((spec: AggregatedSpecResult) => {
        const flaky = spec.runs.some((run: AggregatedSpecRun) =>
          run.tests.some(
            (test: AggregatedTestResult) => test.status === TestStatus.Flaky
          )
        );
        const allPassed = spec.runs.every((run: AggregatedSpecRun) =>
          run.tests.some(
            (test: AggregatedTestResult) => test.status === TestStatus.Expected
          )
        );
        const allFailed = spec.runs.every((run: AggregatedSpecRun) =>
          run.tests.some(
            (test: AggregatedTestResult) =>
              test.status === TestStatus.Unexpected
          )
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
    testStatusFilter: string,
    applicationFilter: string,
    search: string
  ): AggregatedSuiteResult[] {
    let results = testResults;

    if (applicationFilter) {
      results = results.filter(
        (suiteResult: AggregatedSuiteResult) =>
          suiteResult.applicationName === applicationFilter
      );
    }

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      results = results.filter(
        (suiteResult: AggregatedSuiteResult) =>
          suiteResult.suiteTitle.toLowerCase().includes(lowerCaseSearch) ||
          suiteResult.specs.some((spec: AggregatedSpecResult) =>
            spec.title.toLowerCase().includes(lowerCaseSearch)
          )
      );
    }

    if (testStatusFilter === TestStatus.Flaky) {
      results = results
        .map((suiteResult: AggregatedSuiteResult) => ({
          ...suiteResult,
          specs: suiteResult.specs.filter((spec: AggregatedSpecResult) =>
            spec.runs.some((run: AggregatedSpecRun) =>
              run.tests.some(
                (test: AggregatedTestResult) => test.status === TestStatus.Flaky
              )
            )
          ),
        }))
        .filter((suiteResult) => suiteResult.specs.length > 0);
    }

    return results;
  }
}
