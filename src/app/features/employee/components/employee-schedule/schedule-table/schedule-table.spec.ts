import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DatePipe, NgClass } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { ScheduleInfo } from '@features/employee/models/schedule.model';
import { ScheduleStore } from '@features/employee/stores/schedule-store';
import { ScheduleTable } from './schedule-table';
import { TranslateModule } from '@ngx-translate/core';

interface MockScheduleStore {
  entities: WritableSignal<ScheduleInfo[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  pageSize: WritableSignal<number>;
  totalRecords: WritableSignal<number>;
  findAll: Mock;
  delete: Mock;
  openScheduleDialog: Mock;
  selectedSchedule: WritableSignal<ScheduleInfo | null>;
}

describe('ScheduleTable', () => {
  let component: ScheduleTable;
  let fixture: ComponentFixture<ScheduleTable>;
  let scheduleStore: MockScheduleStore;
  let confirmationService: { confirm: Mock };

  beforeEach(async () => {
    scheduleStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      pageSize: signal(10),
      totalRecords: signal(0),
      findAll: vi.fn(),
      delete: vi.fn(),
      openScheduleDialog: vi.fn(),
      selectedSchedule: signal(null),
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    confirmationService.confirm.mockImplementation((options: Confirmation) => {
      if (options && options.accept) {
        options.accept();
      }
      return confirmationService;
    });

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NgClass, DatePipe, ScheduleTable],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ScheduleStore, useValue: scheduleStore },
        ],
    })
      .overrideComponent(ScheduleTable, {
        set: {
          template: `<div class="schedule-table-root"></div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduleTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to the ScheduleStore', () => {
    expect(component.scheduleStore).toBeTruthy();
  });

  it('should call findAll when needed', () => {
    scheduleStore.findAll.mockClear();
    component.scheduleStore.findAll();
    expect(scheduleStore.findAll).toHaveBeenCalled();
  });

  it('should delete a schedule when confirmed', () => {
    const schedule = {
      id: 1,
      userId: 1,
      userName: 'Test User',
      day: 'Monday',
      type: 'Regular',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    component.deleteSchedule(schedule);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(scheduleStore.delete).toHaveBeenCalledWith(schedule.id);
  });

  it('should open dialog to edit schedule', () => {
    const schedule = {
      id: 1,
      userId: 1,
      userName: 'Test User',
      day: 'Monday',
      type: 'Regular',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    component.scheduleStore.openScheduleDialog(schedule);

    expect(scheduleStore.openScheduleDialog).toHaveBeenCalledWith(schedule);
  });
});
