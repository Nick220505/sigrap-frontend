import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ScheduleStore } from '@features/employee/stores/schedule-store';
import { EmployeeSchedule } from './employee-schedule';
import { TranslateModule } from '@ngx-translate/core';

describe('EmployeeSchedule', () => {
  let component: EmployeeSchedule;
  let fixture: ComponentFixture<EmployeeSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        EmployeeSchedule],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        ScheduleStore,
        ],
    })
      .overrideComponent(EmployeeSchedule, {
        set: {
          template: `<div class="employee-schedule-root"></div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to ScheduleStore', () => {
    expect(component.scheduleStore).toBeTruthy();
  });

  it('should have a reference to ScheduleTable', () => {
    expect(component.scheduleTable).toBeTruthy();
  });
});
