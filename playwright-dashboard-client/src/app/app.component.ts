import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'playwright-dashboard-client';

  constructor(private _http: HttpClient) { }

  public ngOnInit(): void {
    this._http
      .get(`${environment.apiUrl}/test-results/aggregated`)
      .subscribe((data) => {
        console.log(data);
      });
  }
}
