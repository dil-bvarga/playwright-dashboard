import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'playwright-dashboard-client';

  constructor(private _http: HttpClient) { }

  public ngOnInit(): void {
    this._http.get('http://localhost:3000').subscribe((data) => {
      console.log(data);
    });
  }
}
