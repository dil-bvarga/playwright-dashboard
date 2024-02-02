import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { startWith, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AggregatedSpecResult, AggregatedSpecRun, AggregatedSuiteResult } from '../../../interfaces/aggregatedSuiteResult';
import { DashboardTestResultsRepository } from '../../repositories/dashboard-test-results-repository-service';

export const DEFAULT_SUITE_RUN_COUNT = '7';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  protected allAggregatedTestResults$: Observable<AggregatedSuiteResult[]>;
  protected lastRunCountForm: FormGroup;

  constructor(private readonly _dashboardTestResultsRepository: DashboardTestResultsRepository, private readonly _fb: FormBuilder) { }

  public ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();
  }

  private initializeForm(): void {
    this.lastRunCountForm = this._fb.group({
      lastRunCount: DEFAULT_SUITE_RUN_COUNT,
    });
  }

  private setupFormValueChanges(): void {
    this.allAggregatedTestResults$ = this.lastRunCountForm.get('lastRunCount').valueChanges.pipe(
      startWith(this.lastRunCountForm.get('lastRunCount').value), // Emit the current value immediately
      switchMap(lastRunCount =>
        this._dashboardTestResultsRepository.getAllAggregatedTestResults(lastRunCount)
      )
    );
  }

  public testTitle(_: number, test: AggregatedSpecResult): string {
    return test.title;
  }

  public testRunSpecId(_: number, testRun: AggregatedSpecRun) {
    return testRun.specId;
  }
}
