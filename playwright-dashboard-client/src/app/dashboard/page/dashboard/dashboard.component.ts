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
  protected filteredTestResults$: Observable<AggregatedSuiteResult[]>;
  protected lastRunCountForm: FormGroup;
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
    this.lastRunCountForm = this._fb.group({
      lastRunCount: DEFAULT_SUITE_RUN_COUNT_OPTION,
      filter: DEFAULT_FILTER_OPTION,
    });
  }

  private setupFormValueChanges(): void {
    const lastRunCountChanges$ = this.lastRunCountForm.get('lastRunCount').valueChanges.pipe(startWith(this.lastRunCountForm.get('lastRunCount').value));
    const filterChanges$ = this.lastRunCountForm.get('filter').valueChanges.pipe(startWith(this.lastRunCountForm.get('filter').value));

    this.filteredTestResults$ = combineLatest([lastRunCountChanges$, filterChanges$]).pipe(
      switchMap(([lastRunCount, filter]) => {
        this.isLoading$.next(true);
        return this._dashboardTestResultsRepository.getAllAggregatedTestResults(lastRunCount).pipe(
          map(testResults => this.filterTestResults(testResults, filter)),
          finalize(() => this.isLoading$.next(false))
        );
      })
    );
  }

  private filterTestResults(testResults: AggregatedSuiteResult[], filter: string): AggregatedSuiteResult[] {
    if (filter === 'flaky') {
      return testResults.map((suiteResult: AggregatedSuiteResult) => ({
        ...suiteResult,
        specs: suiteResult.specs.filter(spec => spec.runs.some(run => run.tests.some(test => test.status === 'flaky'))),
      })).filter(suiteResult => suiteResult.specs.length > 0);
    }
    // Return the original results if no specific filter is applied
    return testResults;
  }
}
