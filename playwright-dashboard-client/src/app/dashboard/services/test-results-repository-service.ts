import { Observable } from 'rxjs';
import { JSONReport } from '../../types/testReporter';
import { AggregatedSuiteResult } from '../../interfaces/aggregated-suite-result';

export abstract class TestResultsRepository {
  public abstract getAllTestResults(): Observable<JSONReport[]>;

  public abstract getAllAggregatedTestResults(from: Date): Observable<AggregatedSuiteResult[]>;
}
