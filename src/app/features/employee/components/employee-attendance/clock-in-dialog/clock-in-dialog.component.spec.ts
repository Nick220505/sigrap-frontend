import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserStore } from '@features/configuration/stores/user.store';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { ClockInDialogComponent } from './clock-in-dialog.component';

describe('ClockInDialogComponent', () => {
  let component: ClockInDialogComponent;
  let fixture: ComponentFixture<ClockInDialogComponent>;

  beforeEach(async () => {
    const attendanceStoreSpy = jasmine.createSpyObj(
      'AttendanceStore',
      ['openClockInDialog', 'closeClockInDialog', 'clockIn'],
      {
        clockInDialogVisible: signal(false),
      },
    );

    const userStoreSpy = jasmine.createSpyObj('UserStore', [], {
      entities: signal([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]),
    });

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputGroupModule,
        InputGroupAddonModule,
        Select,
        ClockInDialogComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: AttendanceStore, useValue: attendanceStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with userId control', () => {
    expect(component.clockInForm).toBeDefined();
    expect(component.clockInForm.get('userId')).toBeDefined();
  });

  it('should have userId as required', () => {
    const userIdControl = component.clockInForm.get('userId');
    userIdControl?.setValue(null);
    expect(userIdControl?.valid).toBeFalse();

    userIdControl?.setValue(1);
    expect(userIdControl?.valid).toBeTrue();
  });
});
