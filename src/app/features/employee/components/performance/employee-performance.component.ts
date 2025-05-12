import { Component, viewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PerformanceDialogComponent } from './performance-dialog/performance-dialog.component';
import { PerformanceTableComponent } from './performance-table/performance-table.component';
import { PerformanceToolbarComponent } from './performance-toolbar/performance-toolbar.component';

@Component({
  selector: 'app-employee-performance',
  imports: [
    CardModule,
    PerformanceTableComponent,
    PerformanceToolbarComponent,
    PerformanceDialogComponent,
  ],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <app-performance-toolbar [performanceTable]="performanceTable" />
      </div>

      <p-card>
        <app-performance-table #performanceTable />
      </p-card>

      <app-performance-dialog />
    </div>
  `,
})
export class EmployeePerformanceComponent {
  readonly performanceTable =
    viewChild.required<PerformanceTableComponent>('performanceTable');
}
