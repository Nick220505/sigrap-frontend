import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserStore } from '@features/configuration/stores/user.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ScheduleStore } from '../../../stores/schedule.store';
import { ScheduleDialogComponent } from './schedule-dialog.component';

describe('ScheduleDialogComponent', () => {
  let component: ScheduleDialogComponent;
  let fixture: ComponentFixture<ScheduleDialogComponent>;

  beforeEach(async () => {
    const scheduleStoreMock = {
      dialogVisible: signal(false),
      selectedSchedule: signal(null),
      openScheduleDialog: jasmine.createSpy('openScheduleDialog'),
      closeScheduleDialog: jasmine.createSpy('closeScheduleDialog'),
      save: jasmine.createSpy('save'),
      update: jasmine.createSpy('update'),
    };

    const userStoreMock = {
      entities: signal([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        Select,
        CalendarModule,
        InputGroupModule,
        InputGroupAddonModule,
        ScheduleDialogComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: ScheduleStore, useValue: scheduleStoreMock },
        { provide: UserStore, useValue: userStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with required fields', () => {
    expect(component.scheduleForm).toBeDefined();
    expect(component.scheduleForm.get('userId')).toBeDefined();
    expect(component.scheduleForm.get('day')).toBeDefined();
    expect(component.scheduleForm.get('type')).toBeDefined();
    expect(component.scheduleForm.get('startTime')).toBeDefined();
    expect(component.scheduleForm.get('endTime')).toBeDefined();
  });

  it('should validate required fields', () => {
    const form = component.scheduleForm;

    expect(form.get('userId')?.valid).toBeFalse();
    expect(form.get('day')?.valid).toBeFalse();
    expect(form.get('type')?.valid).toBeFalse();
    expect(form.get('startTime')?.valid).toBeFalse();
    expect(form.get('endTime')?.valid).toBeFalse();

    form.get('userId')?.setValue(1);
    form.get('day')?.setValue('Lunes');
    form.get('type')?.setValue('Regular');
    form.get('startTime')?.setValue('09:00');
    form.get('endTime')?.setValue('17:00');

    expect(form.get('userId')?.valid).toBeTrue();
    expect(form.get('day')?.valid).toBeTrue();
    expect(form.get('type')?.valid).toBeTrue();
    expect(form.get('startTime')?.valid).toBeTrue();
    expect(form.get('endTime')?.valid).toBeTrue();
    expect(form.valid).toBeTrue();
  });
});
