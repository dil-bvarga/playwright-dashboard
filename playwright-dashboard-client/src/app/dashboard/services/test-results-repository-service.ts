import { Observable } from 'rxjs';
import { JSONReport } from '../../types/testReporter';
import { AggregatedSuiteResult } from '../../interfaces/aggregatedSuiteResult';

export abstract class TestResultsRepository {
  public abstract getAllTestResults(): Observable<JSONReport[]>;

  public abstract getAllAggregatedTestResults(): Observable<AggregatedSuiteResult[]>;
}
