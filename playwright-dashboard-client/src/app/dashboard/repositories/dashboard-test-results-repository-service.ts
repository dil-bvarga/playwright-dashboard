import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestResultsRepository } from '../services/test-results-repository-service';
import { AggregatedSuiteResult } from '../../interfaces/aggregated-suite-result';
import { environment } from '../../../environments/environment';
import { JSONReport } from '../../types/testReporter';

/**
 * `DashboardTestResultsRepository` is a service that extends `TestResultsRepository`.
 * It provides methods to fetch test results from a server.
 */
@Injectable({ providedIn: 'root' })
export class DashboardTestResultsRepository extends TestResultsRepository {
  constructor(private readonly _http: HttpClient) {
    super();
  }

  /**
   * Fetches all test results from the server.
   *
   * @returns {Observable<JSONReport[]>} An Observable that emits the test results.
   */
  public getAllTestResults(): Observable<JSONReport[]> {
    return this._http.get<JSONReport[]>(`${environment.apiUrl}/test-results`);
  }

  /**
   * Fetches all aggregated test results from the server that are from a specific date.
   *
   * @param {Date} from - The date from which to fetch the test results.
   * @returns {Observable<AggregatedSuiteResult[]>} An Observable that emits the aggregated test results.
   */
  public getAllAggregatedTestResults(
    from: Date
  ): Observable<AggregatedSuiteResult[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('from', from.toISOString());

    return this._http.get<AggregatedSuiteResult[]>(
      `${environment.apiUrl}/test-results/aggregated`,
      { params: params }
    );
  }
}
