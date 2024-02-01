import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregatedSuiteResult } from '../../../interfaces/aggregatedSuiteResult';
import { DashboardTestResultsRepository } from '../../repositories/dashboard-test-results-repository-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  protected allAggregatedTestResults$!: Observable<AggregatedSuiteResult[]>;

  constructor(private readonly _dashboardTestResultsRepository: DashboardTestResultsRepository) { }

  public ngOnInit(): void {
    this.allAggregatedTestResults$ = this._dashboardTestResultsRepository.getAllAggregatedTestResults();
  }

}
