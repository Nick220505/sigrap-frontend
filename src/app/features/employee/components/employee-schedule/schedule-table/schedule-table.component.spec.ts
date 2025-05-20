import { DatePipe, NgClass } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ScheduleInfo } from '../../../models/schedule.model';
import { ScheduleStore } from '../../../stores/schedule.store';
import { ScheduleTableComponent } from './schedule-table.component';

interface MockScheduleStore {
  entities: WritableSignal<ScheduleInfo[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  pageSize: WritableSignal<number>;
  totalRecords: WritableSignal<number>;
  findAll: jasmine.Spy;
  delete: jasmine.Spy;
  openScheduleDialog: jasmine.Spy;
  selectedSchedule: WritableSignal<ScheduleInfo | null>;
}

describe('ScheduleTableComponent', () => {
  let component: ScheduleTableComponent;
  let fixture: ComponentFixture<ScheduleTableComponent>;
  let scheduleStore: MockScheduleStore;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    scheduleStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      pageSize: signal(10),
      totalRecords: signal(0),
      findAll: jasmine.createSpy('findAll'),
      delete: jasmine.createSpy('delete'),
      openScheduleDialog: jasmine.createSpy('openScheduleDialog'),
      selectedSchedule: signal(null),
    };

    confirmationService = jasmine.createSpyObj<ConfirmationService>(
      'ConfirmationService',
      ['confirm'],
    );

    confirmationService.confirm.and.callFake((options: Confirmation) => {
      if (options && options.accept) {
        options.accept();
      }
      return confirmationService;
    });

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        TooltipModule,
        PaginatorModule,
        NgClass,
        DatePipe,
        ScheduleTableComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ScheduleStore, useValue: scheduleStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleTableComponent);
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
    scheduleStore.findAll.calls.reset();
    component.scheduleStore.findAll();
    expect(scheduleStore.findAll).toHaveBeenCalled();
  });

  it('should delete a schedule when confirmed', () => {
    const schedule = {
      id: 1,
      userId: 1,
      userName: 'Test User',
      day: 'Lunes',
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
      day: 'Lunes',
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
