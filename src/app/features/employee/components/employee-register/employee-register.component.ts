import { Component, inject, viewChild } from '@angular/core';
import { EmployeeStore } from '../../stores/employee.store';
import { EmployeeDialogComponent } from './employee-dialog/employee-dialog.component';
import { EmployeeTableComponent } from './employee-table/employee-table.component';
import { EmployeeToolbarComponent } from './employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-employee-register',
  imports: [
    EmployeeToolbarComponent,
    EmployeeTableComponent,
    EmployeeDialogComponent,
  ],
  template: `
    <app-employee-toolbar [employeeTable]="employeeTable" />

    <app-employee-table #employeeTable />

    <app-employee-dialog />
  `,
})
export class EmployeeRegisterComponent {
  readonly employeeStore = inject(EmployeeStore);
  readonly employeeTable = viewChild.required(EmployeeTableComponent);
}
