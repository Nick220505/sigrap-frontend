import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceStore } from '@features/employee/stores/attendance-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeAttendance } from './employee-attendance';

describe('EmployeeAttendance', () => {
  let component: EmployeeAttendance;
  let fixture: ComponentFixture<EmployeeAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAttendance, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        AttendanceStore,
      ],
    })
      .overrideComponent(EmployeeAttendance, {
        set: {
          template: `<div class="employee-attendance-root"></div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeAttendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to AttendanceStore', () => {
    expect(component.attendanceStore).toBeTruthy();
  });

  it('should have a reference to AttendanceTable', () => {
    expect(component.attendanceTable).toBeTruthy();
  });
});
