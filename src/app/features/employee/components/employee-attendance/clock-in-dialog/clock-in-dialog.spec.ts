import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStore } from '@features/configuration/stores/user-store';
import { AttendanceStore } from '@features/employee/stores/attendance-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { ClockInDialog } from './clock-in-dialog';

describe('ClockInDialog', () => {
  let component: ClockInDialog;
  let fixture: ComponentFixture<ClockInDialog>;

  beforeEach(async () => {
    const attendanceStoreSpy = {
      openClockInDialog: vi.fn().mockName('AttendanceStore.openClockInDialog'),
      closeClockInDialog: vi
        .fn()
        .mockName('AttendanceStore.closeClockInDialog'),
      clockIn: vi.fn().mockName('AttendanceStore.clockIn'),
      clockInDialogVisible: signal(false),
    };

    const userStoreSpy = {
      entities: signal([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [
        
        DialogModule,
        ButtonModule,
        InputGroupModule,
        InputGroupAddonModule,
        Select,
        ClockInDialog,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: AttendanceStore, useValue: attendanceStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockInDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with userId control', () => {
    expect(component.clockInForm).toBeDefined();
    expect(component.clockInForm.userId).toBeDefined();
  });

  it('should have userId as required', () => {
    component.clockInForm.userId().value.set(null);
    expect(component.clockInForm.userId().valid()).toBe(false);
    expect(
      component.clockInForm
        .userId()
        .errors()
        .some((e) => e.kind === 'required'),
    ).toBe(true);

    component.clockInForm.userId().value.set(1);
    expect(component.clockInForm.userId().valid()).toBe(true);
  });
});
