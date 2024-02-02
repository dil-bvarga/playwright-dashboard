import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { LatestSuiteRunTimePipe } from './pipes/latest-suite-run-time.pipe';
import { AllExpectedTestRunsPipe } from './pipes/all-expected-test-runs.pipe';
import { HasSkippedTestRunsPipe } from './pipes/has-skipped-test-runs.pipe';
import { HasUnexpectedTestRunsPipe } from './pipes/has-unexpected-test-runs.pipe';
import { HasFlakyTestRunsPipe } from './pipes/has-flaky-test-runs.pipe';

@NgModule({
  declarations: [
    DashboardComponent,
    LatestSuiteRunTimePipe,
    AllExpectedTestRunsPipe,
    HasSkippedTestRunsPipe,
    HasUnexpectedTestRunsPipe,
    HasFlakyTestRunsPipe,
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule { }
