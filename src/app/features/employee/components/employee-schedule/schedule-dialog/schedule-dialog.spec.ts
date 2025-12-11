import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserStore } from '@features/configuration/stores/user-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ScheduleStore } from '../../../stores/schedule-store';
import { ScheduleDialog } from './schedule-dialog';

describe('ScheduleDialog', () => {
  let component: ScheduleDialog;
  let fixture: ComponentFixture<ScheduleDialog>;

  beforeEach(async () => {
    const scheduleStoreMock = {
      dialogVisible: signal(false),
      selectedSchedule: signal(null),
      openScheduleDialog: vi.fn(),
      closeScheduleDialog: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
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
        InputGroupModule,
        InputGroupAddonModule,
        ScheduleDialog,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: ScheduleStore, useValue: scheduleStoreMock },
        { provide: UserStore, useValue: userStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleDialog);
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

    expect(form.get('userId')?.valid).toBe(false);
    expect(form.get('day')?.valid).toBe(false);
    expect(form.get('type')?.valid).toBe(false);
    expect(form.get('startTime')?.valid).toBe(false);
    expect(form.get('endTime')?.valid).toBe(false);

    form.get('userId')?.setValue(1);
    form.get('day')?.setValue('Monday');
    form.get('type')?.setValue('Regular');
    form.get('startTime')?.setValue('09:00');
    form.get('endTime')?.setValue('17:00');

    expect(form.get('userId')?.valid).toBe(true);
    expect(form.get('day')?.valid).toBe(true);
    expect(form.get('type')?.valid).toBe(true);
    expect(form.get('startTime')?.valid).toBe(true);
    expect(form.get('endTime')?.valid).toBe(true);
    expect(form.valid).toBe(true);
  });
});
