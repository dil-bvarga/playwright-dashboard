import { Observable } from 'rxjs';
import { JSONReport } from '../../types/testReporter';
import { AggregatedSuiteResult } from '../../interfaces/aggregated-suite-result';

/**
 * `TestResultsRepository` is an abstract class that defines the contract for test results repositories.
 */
export abstract class TestResultsRepository {
  public abstract getAllTestResults(): Observable<JSONReport[]>;

  public abstract getAllAggregatedTestResults(
    from: Date
  ): Observable<AggregatedSuiteResult[]>;

  public abstract getLatestAggregatedTestResults(): Observable<
    AggregatedSuiteResult[]
  >;
}
