import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestResultsRepository } from '../services/test-results-repository-service';
import { AggregatedSuiteResult } from '../../interfaces/aggregated-suite-result';
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

  public getAllAggregatedTestResults(
    from: Date
  ): Observable<AggregatedSuiteResult[]> {
    let params = new HttpParams();
    params = params.append('from', from.toISOString());

    return this._http.get<AggregatedSuiteResult[]>(
      `${environment.apiUrl}/test-results/aggregated`,
      { params: params }
    );
  }
}
