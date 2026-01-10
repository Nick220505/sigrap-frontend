import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      create: vi.fn(),
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
    expect(component.scheduleForm.userId).toBeDefined();
    expect(component.scheduleForm.day).toBeDefined();
    expect(component.scheduleForm.type).toBeDefined();
    expect(component.scheduleForm.startTime).toBeDefined();
    expect(component.scheduleForm.endTime).toBeDefined();
  });

  it('should validate required fields', () => {
    expect(component.scheduleForm.userId().valid()).toBe(false);
    expect(component.scheduleForm.day().valid()).toBe(false);
    expect(component.scheduleForm.type().valid()).toBe(false);
    expect(component.scheduleForm.startTime().valid()).toBe(false);
    expect(component.scheduleForm.endTime().valid()).toBe(false);

    component.scheduleForm.userId().value.set(1);
    component.scheduleForm.day().value.set('Monday');
    component.scheduleForm.type().value.set('Regular');
    component.scheduleForm.startTime().value.set('09:00');
    component.scheduleForm.endTime().value.set('17:00');

    expect(component.scheduleForm.userId().valid()).toBe(true);
    expect(component.scheduleForm.day().valid()).toBe(true);
    expect(component.scheduleForm.type().valid()).toBe(true);
    expect(component.scheduleForm.startTime().valid()).toBe(true);
    expect(component.scheduleForm.endTime().valid()).toBe(true);
    expect(component.scheduleForm().valid()).toBe(true);
  });
});
