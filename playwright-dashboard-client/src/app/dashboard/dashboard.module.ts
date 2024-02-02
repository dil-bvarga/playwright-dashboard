import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { LatestSuiteRunTimePipe } from './pipes/latest-suite-run-time.pipe';

@NgModule({
  declarations: [DashboardComponent, LatestSuiteRunTimePipe],
  imports: [CommonModule, MatExpansionModule, MatIconModule],
  exports: [DashboardComponent],
})
export class DashboardModule { }
