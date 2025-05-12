import { Component, inject, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeeStore } from '../../stores/employee.store';
import { EmployeeTableComponent } from './employee-table/employee-table.component';
import { EmployeeToolbarComponent } from './employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-employee-register',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    EmployeeTableComponent,
    EmployeeToolbarComponent,
  ],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <app-employee-toolbar [employeeTable]="employeeTable" />
      </div>

      <p-card>
        <app-employee-table #employeeTable />
      </p-card>
    </div>
  `,
})
export class EmployeeRegisterComponent {
  private readonly fb = inject(FormBuilder);
  readonly employeeStore = inject(EmployeeStore);
  readonly employeeTable =
    viewChild.required<EmployeeTableComponent>('employeeTable');

  readonly employeeForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentId: ['', [Validators.required]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    position: ['', [Validators.required]],
    department: ['', [Validators.required]],
    hireDate: [null, [Validators.required]],
    profileImageUrl: [''],
    status: ['ACTIVE'],
  });
}
