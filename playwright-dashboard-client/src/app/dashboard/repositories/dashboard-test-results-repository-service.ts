import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TestResultsRepository } from '../services/test-results-repository-service';
import { Observable } from 'rxjs';
import { AggregatedSuiteResult } from '../../interfaces/aggregatedSuiteResult';
import { environment } from '../../../environments/environment';
import { JSONReport } from '../../types/testReporter';

@Injectable({ providedIn: 'root' })
export class DashboardTestResultsRepository extends TestResultsRepository {
  constructor(private readonly _http: HttpClient) {
    super();
  }

  public getAllTestResults(): Observable<JSONReport[]> {
    return this._http.get<JSONReport[]>(`${environment.apiUrl}/test-results`);
  }

  public getAllAggregatedTestResults(testSuiteRunCount: number): Observable<AggregatedSuiteResult[]> {
    let params = new HttpParams();
    params = params.append('testSuiteRunCount', testSuiteRunCount);

    return this._http.get<AggregatedSuiteResult[]>(`${environment.apiUrl}/test-results/aggregated`, { params: params });
  }
}
