import { Component, inject, viewChild } from '@angular/core';
import { PerformanceStore } from '../../stores/performance.store';
import { PerformanceDialogComponent } from './performance-dialog/performance-dialog.component';
import { PerformanceTableComponent } from './performance-table/performance-table.component';
import { PerformanceToolbarComponent } from './performance-toolbar/performance-toolbar.component';

@Component({
  selector: 'app-employee-performance',
  imports: [
    PerformanceToolbarComponent,
    PerformanceTableComponent,
    PerformanceDialogComponent,
  ],
  template: `
    <app-performance-toolbar [performanceTable]="performanceTable" />

    <app-performance-table #performanceTable />

    <app-performance-dialog />
  `,
})
export class EmployeePerformanceComponent {
  readonly performanceStore = inject(PerformanceStore);
  readonly performanceTable = viewChild.required(PerformanceTableComponent);
}
