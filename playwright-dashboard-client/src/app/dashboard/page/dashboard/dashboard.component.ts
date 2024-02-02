import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import {
  AggregatedSpecResult,
  AggregatedSpecRun,
  AggregatedSuiteResult,
} from '../../../interfaces/aggregatedSuiteResult';
import { DashboardTestResultsRepository } from '../../repositories/dashboard-test-results-repository-service';
import { MatAccordion } from '@angular/material/expansion';

export const DEFAULT_SUITE_RUN_COUNT_OPTION = '7';
export const DEFAULT_FILTER_OPTION = '';

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
  private _destroyed$ = new Subject<void>();

  @ViewChild('accordion', { static: true }) protected accordion: MatAccordion;

  constructor(
    private readonly _dashboardTestResultsRepository: DashboardTestResultsRepository,
    private readonly _fb: FormBuilder
  ) { }

  public ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();

    this.isLoading$
      .asObservable()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((isLoading: boolean) => {
        if (isLoading) {
          this.accordion.closeAll();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  public testTitle(_: number, test: AggregatedSpecResult): string {
    return test.title;
  }

  public testRunSpecId(_: number, testRun: AggregatedSpecRun) {
    return testRun.specId;
  }

  public clickOnSuite(_: Event) {
    if (this.isLoading$.getValue() === true) {
      this.accordion.closeAll();
    }
  }

  private initializeForm(): void {
    this.queryForm = this._fb.group({
      lastRunCount: DEFAULT_SUITE_RUN_COUNT_OPTION,
      filter: DEFAULT_FILTER_OPTION,
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
    ])
      .pipe(
        map(([results, filter]) => {
          // Apply the filter to the results
          return this.filterTestResults(results, filter);
        }),
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
          run.tests.some((test) => test.status === 'flaky')
        );
        const allPassed = spec.runs.every((run) =>
          run.tests.some((test) => test.status === 'expected')
        );
        const allFailed = spec.runs.every((run) =>
          run.tests.some((test) => test.status === 'unexpected')
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
    filter: string
  ): AggregatedSuiteResult[] {
    if (filter === 'flaky') {
      return testResults
        .map((suiteResult: AggregatedSuiteResult) => ({
          ...suiteResult,
          specs: suiteResult.specs.filter((spec) =>
            spec.runs.some((run) =>
              run.tests.some((test) => test.status === 'flaky')
            )
          ),
        }))
        .filter((suiteResult) => suiteResult.specs.length > 0);
    }
    // Return the original results if no specific filter is applied
    return testResults;
  }
}
