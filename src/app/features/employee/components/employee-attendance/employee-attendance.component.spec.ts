import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceToolbarComponent } from './attendance-toolbar/attendance-toolbar.component';
import { ClockInDialogComponent } from './clock-in-dialog/clock-in-dialog.component';
import { EmployeeAttendanceComponent } from './employee-attendance.component';

describe('EmployeeAttendanceComponent', () => {
  let component: EmployeeAttendanceComponent;
  let fixture: ComponentFixture<EmployeeAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        EmployeeAttendanceComponent,
        AttendanceTableComponent,
        AttendanceToolbarComponent,
        ClockInDialogComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        AttendanceStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to AttendanceStore', () => {
    expect(component.attendanceStore).toBeTruthy();
  });

  it('should have a reference to AttendanceTableComponent', () => {
    expect(component.attendanceTable).toBeTruthy();
  });
});
